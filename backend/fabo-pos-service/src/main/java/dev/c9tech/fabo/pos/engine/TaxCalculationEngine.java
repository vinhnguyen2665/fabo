package dev.c9tech.fabo.pos.engine;

import dev.c9tech.fabo.pos.enums.TaxMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * TaxCalculationEngine handles Vietnamese VAT compliance (TT78/2021/TT-BTC)
 * for both TAX_INCLUSIVE and TAX_EXCLUSIVE pricing regimes, supporting multi-rate VAT (0%, 5%, 8%, 10%).
 */
@Component
public class TaxCalculationEngine {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxItemInput {
        private String itemId;
        private String itemName;
        private BigDecimal unitPrice;       // Đơn giá món
        private int quantity;               // Số lượng
        private BigDecimal taxRate;         // Thuế suất (0.00, 0.05, 0.08, 0.10)
        private BigDecimal itemDiscount;    // Chiết khấu riêng của từng món
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxCalculationResult {
        private TaxMode taxMode;
        private BigDecimal rawSubtotal;         // Tổng tiền hàng gốc
        private BigDecimal totalDiscount;       // Tổng giảm giá
        private BigDecimal netSubtotal;         // Tiền hàng sau giảm giá
        private BigDecimal serviceChargeAmount; // Phí dịch vụ
        private BigDecimal totalTax;            // Tổng tiền thuế GTGT
        private Map<String, BigDecimal> taxBreakdownByRate; // Bóc tách thuế theo từng mức ("8%": 12000, "10%": 25000)
        private BigDecimal finalAmount;         // Tổng số tiền khách cần thanh toán
        private List<TaxItemOutput> processedItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxItemOutput {
        private String itemId;
        private String itemName;
        private int quantity;
        private BigDecimal grossAmount;         // Tiền hàng
        private BigDecimal allocatedDiscount;   // Chiết khấu phân bổ
        private BigDecimal taxableBaseAmount;   // Doanh thu tính thuế
        private BigDecimal taxRate;             // Tỷ lệ thuế
        private BigDecimal taxAmount;           // Tiền thuế của món
        private BigDecimal lineTotal;           // Tổng dòng sau thuế và giảm giá
    }

    /**
     * Calculates order taxation and pricing breakdown.
     *
     * @param items               List of order items
     * @param taxMode             TAX_INCLUSIVE or TAX_EXCLUSIVE
     * @param orderLevelDiscount  Total global discount (VND)
     * @param serviceChargeRate   Service charge percentage (e.g. 0.05 for 5%)
     * @param isServiceChargeTaxable Whether service charge is subject to VAT (usually 10%)
     */
    public TaxCalculationResult calculate(
            List<TaxItemInput> items,
            TaxMode taxMode,
            BigDecimal orderLevelDiscount,
            BigDecimal serviceChargeRate,
            boolean isServiceChargeTaxable
    ) {
        if (items == null || items.isEmpty()) {
            return TaxCalculationResult.builder()
                    .taxMode(taxMode)
                    .rawSubtotal(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .netSubtotal(BigDecimal.ZERO)
                    .serviceChargeAmount(BigDecimal.ZERO)
                    .totalTax(BigDecimal.ZERO)
                    .taxBreakdownByRate(Collections.emptyMap())
                    .finalAmount(BigDecimal.ZERO)
                    .processedItems(Collections.emptyList())
                    .build();
        }

        BigDecimal globalDiscount = orderLevelDiscount != null ? orderLevelDiscount : BigDecimal.ZERO;
        BigDecimal sRate = serviceChargeRate != null ? serviceChargeRate : BigDecimal.ZERO;

        // Step 1: Calculate raw line amounts
        BigDecimal totalGross = BigDecimal.ZERO;
        List<BigDecimal> rawLineTotals = new ArrayList<>();

        for (TaxItemInput item : items) {
            BigDecimal lineAmount = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            rawLineTotals.add(lineAmount);
            totalGross = totalGross.add(lineAmount);
        }

        // Step 2: Allocate global order discount proportionally across items
        List<BigDecimal> allocatedDiscounts = new ArrayList<>();
        BigDecimal sumAllocatedDiscount = BigDecimal.ZERO;

        for (int i = 0; i < items.size(); i++) {
            TaxItemInput item = items.get(i);
            BigDecimal itemDirectDiscount = item.getItemDiscount() != null ? item.getItemDiscount() : BigDecimal.ZERO;

            BigDecimal propDiscount = BigDecimal.ZERO;
            if (totalGross.compareTo(BigDecimal.ZERO) > 0 && globalDiscount.compareTo(BigDecimal.ZERO) > 0) {
                // If it's the last item, assign remaining discount to avoid fractional pennies
                if (i == items.size() - 1) {
                    propDiscount = globalDiscount.subtract(sumAllocatedDiscount);
                } else {
                    propDiscount = globalDiscount.multiply(rawLineTotals.get(i))
                            .divide(totalGross, 0, RoundingMode.HALF_UP);
                    sumAllocatedDiscount = sumAllocatedDiscount.add(propDiscount);
                }
            }

            BigDecimal totalItemDiscount = itemDirectDiscount.add(propDiscount);
            // Cap discount to line total
            if (totalItemDiscount.compareTo(rawLineTotals.get(i)) > 0) {
                totalItemDiscount = rawLineTotals.get(i);
            }
            allocatedDiscounts.add(totalItemDiscount);
        }

        BigDecimal totalDiscountSum = allocatedDiscounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netSubtotal = totalGross.subtract(totalDiscountSum);

        // Step 3: Compute Service Charge
        BigDecimal serviceChargeAmount = netSubtotal.multiply(sRate).setScale(0, RoundingMode.HALF_UP);

        // Step 4: Calculate Taxes for each item
        List<TaxItemOutput> processedItems = new ArrayList<>();
        Map<String, BigDecimal> breakdown = new HashMap<>();
        BigDecimal totalTax = BigDecimal.ZERO;

        for (int i = 0; i < items.size(); i++) {
            TaxItemInput item = items.get(i);
            BigDecimal lineGross = rawLineTotals.get(i);
            BigDecimal lineDiscount = allocatedDiscounts.get(i);
            BigDecimal lineAfterDiscount = lineGross.subtract(lineDiscount);
            BigDecimal rate = item.getTaxRate() != null ? item.getTaxRate() : BigDecimal.ZERO;

            BigDecimal taxableBase;
            BigDecimal taxAmount;
            BigDecimal lineFinal;

            if (taxMode == TaxMode.TAX_INCLUSIVE) {
                // Base = Price / (1 + Rate)
                BigDecimal divisor = BigDecimal.ONE.add(rate);
                taxableBase = lineAfterDiscount.divide(divisor, 2, RoundingMode.HALF_UP);
                taxAmount = lineAfterDiscount.subtract(taxableBase).setScale(0, RoundingMode.HALF_UP);
                lineFinal = lineAfterDiscount; // Already includes tax
            } else {
                // TAX_EXCLUSIVE: Tax = Base * Rate
                taxableBase = lineAfterDiscount;
                taxAmount = taxableBase.multiply(rate).setScale(0, RoundingMode.HALF_UP);
                lineFinal = taxableBase.add(taxAmount);
            }

            totalTax = totalTax.add(taxAmount);

            String rateKey = rate.multiply(BigDecimal.valueOf(100)).stripTrailingZeros().toPlainString() + "%";
            breakdown.put(rateKey, breakdown.getOrDefault(rateKey, BigDecimal.ZERO).add(taxAmount));

            processedItems.add(TaxItemOutput.builder()
                    .itemId(item.getItemId())
                    .itemName(item.getItemName())
                    .quantity(item.getQuantity())
                    .grossAmount(lineGross)
                    .allocatedDiscount(lineDiscount)
                    .taxableBaseAmount(taxableBase.setScale(0, RoundingMode.HALF_UP))
                    .taxRate(rate)
                    .taxAmount(taxAmount)
                    .lineTotal(lineFinal)
                    .build());
        }

        // Add service charge VAT if applicable (standard 10%)
        if (isServiceChargeTaxable && serviceChargeAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal serviceTaxRate = new BigDecimal("0.10");
            BigDecimal serviceTax = serviceChargeAmount.multiply(serviceTaxRate).setScale(0, RoundingMode.HALF_UP);
            totalTax = totalTax.add(serviceTax);
            breakdown.put("10%", breakdown.getOrDefault("10%", BigDecimal.ZERO).add(serviceTax));
        }

        // Step 5: Final Amount
        BigDecimal finalAmount;
        if (taxMode == TaxMode.TAX_INCLUSIVE) {
            // final = netSubtotal + serviceCharge (tax is already included in netSubtotal)
            finalAmount = netSubtotal.add(serviceChargeAmount);
        } else {
            // final = netSubtotal + serviceCharge + totalTax
            finalAmount = netSubtotal.add(serviceChargeAmount).add(totalTax);
        }

        return TaxCalculationResult.builder()
                .taxMode(taxMode)
                .rawSubtotal(totalGross.setScale(0, RoundingMode.HALF_UP))
                .totalDiscount(totalDiscountSum.setScale(0, RoundingMode.HALF_UP))
                .netSubtotal(netSubtotal.setScale(0, RoundingMode.HALF_UP))
                .serviceChargeAmount(serviceChargeAmount)
                .totalTax(totalTax)
                .taxBreakdownByRate(breakdown)
                .finalAmount(finalAmount.setScale(0, RoundingMode.HALF_UP))
                .processedItems(processedItems)
                .build();
    }
}
