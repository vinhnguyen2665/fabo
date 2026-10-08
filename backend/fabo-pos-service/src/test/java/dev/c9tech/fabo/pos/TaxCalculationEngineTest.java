package dev.c9tech.fabo.pos;

import dev.c9tech.fabo.pos.engine.TaxCalculationEngine;
import dev.c9tech.fabo.pos.enums.TaxMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TaxCalculationEngineTest {

    private TaxCalculationEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TaxCalculationEngine();
    }

    @Test
    @DisplayName("TAX_INCLUSIVE: 100,000 VND at 10% VAT -> Base ~90,909, Tax ~9,091")
    void testTaxInclusiveSingleItem() {
        List<TaxCalculationEngine.TaxItemInput> items = List.of(
                TaxCalculationEngine.TaxItemInput.builder()
                        .itemId("item-1")
                        .itemName("Lẩu Thái Hải Sản")
                        .unitPrice(new BigDecimal("100000"))
                        .quantity(1)
                        .taxRate(new BigDecimal("0.10"))
                        .build()
        );

        TaxCalculationEngine.TaxCalculationResult result = engine.calculate(
                items,
                TaxMode.TAX_INCLUSIVE,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                false
        );

        assertEquals(new BigDecimal("100000"), result.getFinalAmount());
        assertEquals(new BigDecimal("9091"), result.getTotalTax());
        assertEquals(new BigDecimal("9091"), result.getTaxBreakdownByRate().get("10%"));
    }

    @Test
    @DisplayName("TAX_EXCLUSIVE: 100,000 VND at 8% VAT -> Tax 8,000, Final 108,000")
    void testTaxExclusiveSingleItem() {
        List<TaxCalculationEngine.TaxItemInput> items = List.of(
                TaxCalculationEngine.TaxItemInput.builder()
                        .itemId("item-2")
                        .itemName("Cà Phê Muối")
                        .unitPrice(new BigDecimal("100000"))
                        .quantity(1)
                        .taxRate(new BigDecimal("0.08"))
                        .build()
        );

        TaxCalculationEngine.TaxCalculationResult result = engine.calculate(
                items,
                TaxMode.TAX_EXCLUSIVE,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                false
        );

        assertEquals(new BigDecimal("8000"), result.getTotalTax());
        assertEquals(new BigDecimal("108000"), result.getFinalAmount());
        assertEquals(new BigDecimal("8000"), result.getTaxBreakdownByRate().get("8%"));
    }

    @Test
    @DisplayName("Multi-rate items with discount and service charge")
    void testMultiRateWithDiscountAndServiceCharge() {
        List<TaxCalculationEngine.TaxItemInput> items = List.of(
                TaxCalculationEngine.TaxItemInput.builder()
                        .itemId("food-1")
                        .itemName("Phở Bò (8% VAT)")
                        .unitPrice(new BigDecimal("60000"))
                        .quantity(2) // 120,000
                        .taxRate(new BigDecimal("0.08"))
                        .build(),
                TaxCalculationEngine.TaxItemInput.builder()
                        .itemId("drink-1")
                        .itemName("Bia Craft (10% VAT)")
                        .unitPrice(new BigDecimal("40000"))
                        .quantity(2) // 80,000
                        .taxRate(new BigDecimal("0.10"))
                        .build()
        );

        // Total Gross = 200,000 VND. Global Discount = 20,000 VND (10% discount).
        // Net Subtotal = 180,000 VND. Service charge = 5% (9,000 VND).
        TaxCalculationEngine.TaxCalculationResult result = engine.calculate(
                items,
                TaxMode.TAX_EXCLUSIVE,
                new BigDecimal("20000"),
                new BigDecimal("0.05"),
                true // service charge taxable at 10%
        );

        assertEquals(new BigDecimal("200000"), result.getRawSubtotal());
        assertEquals(new BigDecimal("20000"), result.getTotalDiscount());
        assertEquals(new BigDecimal("180000"), result.getNetSubtotal());
        assertEquals(new BigDecimal("9000"), result.getServiceChargeAmount());
        assertTrue(result.getTotalTax().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.getFinalAmount().compareTo(new BigDecimal("189000")) > 0);
    }
}
