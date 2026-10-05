package dev.c9tech.fabo.payment.controller;

import dev.c9tech.fabo.payment.dto.PaymentWebhookPayload;
import dev.c9tech.fabo.payment.event.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentWebhookController {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    public static final String PAYMENT_COMPLETED_TOPIC = "payment.completed";

    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(?i)(?:FABO|ORD|INV)[-_\\s]?(\\w+)");

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handlePaymentWebhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody PaymentWebhookPayload payload
    ) {
        log.info("Nhận IPN biến động số dư từ Payment Gateway: amount={}, ref={}, content={}",
                payload.getAmount(), payload.getTransactionId(), payload.getContent());

        // Extract Order ID from Content (Tag 62 sub 08 purpose / remark)
        String orderId = payload.getOrderId();
        if ((orderId == null || orderId.trim().isEmpty()) && payload.getContent() != null) {
            Matcher matcher = ORDER_CODE_PATTERN.matcher(payload.getContent());
            if (matcher.find()) {
                orderId = matcher.group(1);
            } else {
                orderId = payload.getContent().trim();
            }
        }

        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(orderId)
                .invoiceId(payload.getInvoiceId() != null ? payload.getInvoiceId() : orderId)
                .amount(payload.getAmount())
                .paymentMethod("VIETQR")
                .transactionRef(payload.getTransactionId())
                .completedAt(Instant.now())
                .build();

        // Publish event to Kafka
        kafkaTemplate.send(PAYMENT_COMPLETED_TOPIC, event.getOrderId(), event);
        log.info("Đã phát Kafka event payment.completed cho orderId={}", event.getOrderId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment IPN processed and dispatched to Kafka topic",
                "orderId", event.getOrderId()
        ));
    }
}
