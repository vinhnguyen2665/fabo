package dev.c9tech.fabo.pos.controller;

import dev.c9tech.fabo.pos.engine.TaxCalculationEngine;
import dev.c9tech.fabo.pos.entity.DiningTable;
import dev.c9tech.fabo.pos.entity.Invoice;
import dev.c9tech.fabo.pos.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final TaxCalculationEngine taxEngine;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String ORDER_CREATED_TOPIC = "order.created";
    public static final String TABLE_STATUS_CHANGED_TOPIC = "table.status-changed";

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderDto {
        private String branchId;
        private String tableId;
        private String tableName;
        private String cashierId;
        private List<OrderItemDto> items;
        private BigDecimal orderDiscount;
        private BigDecimal serviceChargeRate;
        private boolean isTaxInclusive;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private String menuItemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private String modifiersJson;
        private String note;
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderDto dto) {
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Khởi tạo Order {} cho bàn {} tại chi nhánh {}", orderId, dto.getTableId(), dto.getBranchId());

        // Convert to Tax Item Inputs
        List<TaxCalculationEngine.TaxItemInput> taxInputs = new ArrayList<>();
        if (dto.getItems() != null) {
            for (OrderItemDto item : dto.getItems()) {
                taxInputs.add(TaxCalculationEngine.TaxItemInput.builder()
                        .itemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .taxRate(item.getTaxRate())
                        .itemDiscount(BigDecimal.ZERO)
                        .build());
            }
        }

        TaxCalculationEngine.TaxMode mode = dto.isTaxInclusive()
                ? TaxCalculationEngine.TaxMode.TAX_INCLUSIVE
                : TaxCalculationEngine.TaxMode.TAX_EXCLUSIVE;

        TaxCalculationEngine.TaxCalculationResult calcResult = taxEngine.calculate(
                taxInputs,
                mode,
                dto.getOrderDiscount(),
                dto.getServiceChargeRate(),
                true
        );

        // Build Kafka Event Payload
        Map<String, Object> orderEvent = new HashMap<>();
        orderEvent.put("orderId", orderId);
        orderEvent.put("branchId", dto.getBranchId());
        orderEvent.put("tableId", dto.getTableId());
        orderEvent.put("tableName", dto.getTableName());
        orderEvent.put("items", dto.getItems());
        orderEvent.put("subtotal", calcResult.getNetSubtotal());
        orderEvent.put("totalTax", calcResult.getTotalTax());
        orderEvent.put("finalAmount", calcResult.getFinalAmount());
        orderEvent.put("createdAt", LocalDateTime.now().toString());

        // Dispatch to Kafka topic
        kafkaTemplate.send(ORDER_CREATED_TOPIC, orderId, orderEvent);
        log.info("Đã phát sự kiện {} tới Kafka topic {}", orderId, ORDER_CREATED_TOPIC);

        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "tableId", dto.getTableId(),
                "status", "CREATED",
                "pricing", calcResult
        ));
    }

    @PostMapping("/orders/{orderId}/checkout-preview")
    public ResponseEntity<TaxCalculationEngine.TaxCalculationResult> previewCheckout(
            @PathVariable String orderId,
            @RequestBody CreateOrderDto dto
    ) {
        List<TaxCalculationEngine.TaxItemInput> taxInputs = new ArrayList<>();
        if (dto.getItems() != null) {
            for (OrderItemDto item : dto.getItems()) {
                taxInputs.add(TaxCalculationEngine.TaxItemInput.builder()
                        .itemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .taxRate(item.getTaxRate())
                        .build());
            }
        }

        TaxCalculationEngine.TaxMode mode = dto.isTaxInclusive()
                ? TaxCalculationEngine.TaxMode.TAX_INCLUSIVE
                : TaxCalculationEngine.TaxMode.TAX_EXCLUSIVE;

        TaxCalculationEngine.TaxCalculationResult result = taxEngine.calculate(
                taxInputs,
                mode,
                dto.getOrderDiscount(),
                dto.getServiceChargeRate(),
                true
        );

        return ResponseEntity.ok(result);
    }
}
