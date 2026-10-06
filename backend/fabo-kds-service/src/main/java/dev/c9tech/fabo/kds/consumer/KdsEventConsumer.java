package dev.c9tech.fabo.kds.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KdsEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final dev.c9tech.fabo.kds.service.KdsService kdsService;

    public static final String KDS_OUT_OF_STOCK_TOPIC = "kds.item-out-of-stock";

    @KafkaListener(topics = "order.created", groupId = "fabo-kds-group")
    public void handleOrderCreated(Map<String, Object> payload) {
        String orderId = (String) payload.get("orderId");
        String branchId = (String) payload.get("branchId");
        log.info("KDS nhận order mới: {} cho chi nhánh {}", orderId, branchId);

        kdsService.saveIncomingTicket(payload);

        // Broadcast order to kitchen display clients via WebSocket STOMP
        String destination = "/topic/branch/" + (branchId != null ? branchId : "default") + "/kitchen";
        messagingTemplate.convertAndSend(destination, payload);
        log.info("Đã bắn STOMP message tới destination: {}", destination);
    }

    /**
     * Mark an item as Out Of Stock from KDS screen
     */
    public void markItemOutOfStock(String branchId, String itemId) {
        String redisKey = String.format("out_of_stock:%s:%s", branchId, itemId);
        redisTemplate.opsForValue().set(redisKey, "true");

        Map<String, Object> outOfStockEvent = Map.of(
                "branchId", branchId,
                "itemId", itemId,
                "outOfStock", true
        );

        kafkaTemplate.send(KDS_OUT_OF_STOCK_TOPIC, itemId, outOfStockEvent);
        log.warn("KDS Báo hết món khẩn cấp: branch={}, item={}", branchId, itemId);
    }
}
