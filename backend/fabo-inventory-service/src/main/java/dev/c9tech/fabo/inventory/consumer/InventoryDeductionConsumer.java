package dev.c9tech.fabo.inventory.consumer;

import dev.c9tech.fabo.inventory.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryDeductionConsumer {

    private final IngredientRepository ingredientRepository;

    @Transactional
    @KafkaListener(topics = "payment.completed", groupId = "fabo-inventory-group")
    public void handlePaymentCompleted(Map<String, Object> payload) {
        String orderId = (String) payload.get("orderId");
        String invoiceId = (String) payload.get("invoiceId");
        log.info("Inventory nhận event payment.completed cho orderId={}, invoiceId={}", orderId, invoiceId);

        // Giả lập danh sách nguyên liệu cần trừ từ Recipe BOM của đơn hàng
        // Trong hệ thống đầy đủ, query Recipe BOM từ DB theo order item IDs
        deductIngredientSafely("ING-BEEF-01", new BigDecimal("150"), orderId);
        deductIngredientSafely("ING-NOODLE-01", new BigDecimal("200"), orderId);
    }

    private void deductIngredientSafely(String ingredientId, BigDecimal qty, String orderId) {
        int rowsUpdated = ingredientRepository.deductStockAtomic(ingredientId, qty);
        if (rowsUpdated > 0) {
            log.info("Trừ kho nguyên tử thành công: nguyên liệu={}, số lượng={}, đơn={}", ingredientId, qty, orderId);
        } else {
            log.warn("CẢNH BÁO ÂM KHO: Không thể trừ nguyên liệu={} số lượng={} cho đơn={}. Tồn kho không đủ!",
                    ingredientId, qty, orderId);
            // Ghi nhận log cảnh báo hoặc thông báo WebSocket tới thủ kho
        }
    }
}
