package dev.c9tech.fabo.pos.service.impl;

import dev.c9tech.fabo.pos.dto.*;
import dev.c9tech.fabo.pos.engine.TaxCalculationEngine;
import dev.c9tech.fabo.pos.entity.*;
import dev.c9tech.fabo.pos.repository.*;
import dev.c9tech.fabo.pos.service.PosOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosOrderServiceImpl implements PosOrderService {

    private final DiningTableRepository tableRepository;
    private final OrderItemRepository orderItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaxCalculationEngine taxEngine;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String ORDER_CREATED_TOPIC = "order.created";

    @Override
    public Map<String, Object> getTableActiveOrder(String tableId) {
        DiningTable table = tableRepository.findById(tableId).orElse(null);
        if (table == null || table.getActiveOrderId() == null) {
            return Map.of("items", Collections.emptyList(), "table", table != null ? table : Collections.emptyMap());
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(table.getActiveOrderId());
        List<Map<String, Object>> cartItems = new ArrayList<>();
        for (OrderItem it : items) {
            Map<String, Object> c = new HashMap<>();
            c.put("id", it.getId());
            c.put("menuItemId", it.getMenuItemId());
            c.put("itemName", it.getItemName());
            c.put("unitPrice", it.getUnitPrice());
            c.put("quantity", it.getQuantity());
            c.put("taxRate", it.getTaxRate());
            c.put("selectedModifiers", Collections.emptyList());
            c.put("note", it.getNote());
            cartItems.add(c);
        }

        return Map.of(
                "orderId", table.getActiveOrderId(),
                "table", table,
                "items", cartItems
        );
    }

    @Override
    @Transactional
    public Map<String, Object> createOrder(CreateOrderDto dto) {
        log.info("Tạo order mới cho bàn: {}", dto.getTableName());
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        DiningTable table = tableRepository.findById(dto.getTableId()).orElse(null);
        if (table != null) {
            table.setStatus(DiningTable.TableStatus.OCCUPIED);
            table.setActiveOrderId(orderId);
            table.setLastStatusChange(LocalDateTime.now());
            tableRepository.save(table);
        }

        List<OrderItem> savedItems = new ArrayList<>();
        if (dto.getItems() != null) {
            for (OrderItemDto itemDto : dto.getItems()) {
                BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : BigDecimal.ZERO;
                int qty = itemDto.getQuantity() != null ? itemDto.getQuantity() : 1;
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));

                OrderItem entity = OrderItem.builder()
                        .id("ITEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .orderId(orderId)
                        .menuItemId(itemDto.getMenuItemId())
                        .itemName(itemDto.getItemName())
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .taxRate(itemDto.getTaxRate() != null ? itemDto.getTaxRate() : new BigDecimal("0.08"))
                        .itemDiscount(BigDecimal.ZERO)
                        .lineTotal(lineTotal)
                        .modifiersJson(itemDto.getModifiersJson())
                        .note(itemDto.getNote())
                        .kitchenStatus(OrderItem.KitchenStatus.PENDING)
                        .build();
                savedItems.add(orderItemRepository.save(entity));
            }
        }

        TaxCalculationEngine.TaxMode taxMode = dto.isTaxInclusive()
                ? TaxCalculationEngine.TaxMode.TAX_INCLUSIVE
                : TaxCalculationEngine.TaxMode.TAX_EXCLUSIVE;

        List<TaxCalculationEngine.TaxItemInput> taxInputs = new ArrayList<>();
        if (dto.getItems() != null) {
            for (OrderItemDto it : dto.getItems()) {
                taxInputs.add(TaxCalculationEngine.TaxItemInput.builder()
                        .itemId(it.getMenuItemId())
                        .itemName(it.getItemName())
                        .unitPrice(it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO)
                        .quantity(it.getQuantity() != null ? it.getQuantity() : 1)
                        .taxRate(it.getTaxRate() != null ? it.getTaxRate() : new BigDecimal("0.08"))
                        .itemDiscount(BigDecimal.ZERO)
                        .build());
            }
        }

        TaxCalculationEngine.TaxCalculationResult calc = taxEngine.calculate(
                taxInputs,
                taxMode,
                dto.getOrderDiscount() != null ? dto.getOrderDiscount() : BigDecimal.ZERO,
                dto.getServiceChargeRate() != null ? dto.getServiceChargeRate() : new BigDecimal("0.05"),
                true
        );

        Invoice invoice = Invoice.builder()
                .id("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .orderId(orderId)
                .branchId(dto.getBranchId() != null ? dto.getBranchId() : "B01")
                .tableId(dto.getTableId())
                .tableName(dto.getTableName())
                .cashierId(dto.getCashierId() != null ? dto.getCashierId() : "usr-01")
                .rawSubtotal(calc.getRawSubtotal())
                .totalDiscount(calc.getTotalDiscount())
                .serviceChargeAmount(calc.getServiceChargeAmount())
                .totalTax(calc.getTotalTax())
                .finalAmount(calc.getFinalAmount())
                .paymentStatus(Invoice.PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        invoiceRepository.save(invoice);

        try {
            Map<String, Object> kdsEvent = new HashMap<>();
            kdsEvent.put("orderId", orderId);
            kdsEvent.put("tableId", dto.getTableId());
            kdsEvent.put("tableName", dto.getTableName());
            kdsEvent.put("branchId", dto.getBranchId());
            kdsEvent.put("items", savedItems);
            kdsEvent.put("timestamp", LocalDateTime.now().toString());
            kafkaTemplate.send(ORDER_CREATED_TOPIC, orderId, kdsEvent);
        } catch (Exception e) {
            log.warn("Kafka không sẵn sàng, bỏ qua event KDS: {}", e.getMessage());
        }

        return Map.of(
                "id", orderId,
                "orderId", orderId,
                "invoiceId", invoice.getId(),
                "calculation", calc,
                "items", savedItems
        );
    }

    @Override
    @Transactional
    public Map<String, Object> payInvoice(String orderId, PayInvoiceDto dto) {
        log.info("Thanh toán cho đơn hàng: {}", orderId);
        Invoice invoice = invoiceRepository.findByOrderId(orderId).orElse(null);
        if (invoice != null) {
            invoice.setPaymentStatus(Invoice.PaymentStatus.PAID);
            invoice.setPaymentMethod(dto.getPaymentMethod());
            invoice.setPaidAt(LocalDateTime.now());
            if (dto.getCashierId() != null) {
                invoice.setCashierId(dto.getCashierId());
            }
            if (Boolean.TRUE.equals(dto.getEInvoiceRequested())) {
                invoice.setEInvoiceRequested(true);
                invoice.setBuyerTaxCode(dto.getBuyerTaxCode());
                invoice.setBuyerCompanyName(dto.getBuyerCompanyName());
                invoice.setBuyerEmail(dto.getBuyerEmail());
                invoice.setEInvoiceStatus("REQUESTED");
            }
            invoiceRepository.save(invoice);
        }

        tableRepository.findByActiveOrderId(orderId).ifPresent(tbl -> {
            tbl.setStatus(DiningTable.TableStatus.CLEANING);
            tbl.setActiveOrderId(null);
            tbl.setLastStatusChange(LocalDateTime.now());
            tableRepository.save(tbl);
        });

        return Map.of(
                "status", "PAID",
                "orderId", orderId,
                "invoiceId", invoice != null ? invoice.getId() : "",
                "paymentMethod", dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "CASH"
        );
    }
}
