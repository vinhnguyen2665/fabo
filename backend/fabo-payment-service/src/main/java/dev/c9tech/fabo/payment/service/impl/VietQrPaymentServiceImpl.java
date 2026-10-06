package dev.c9tech.fabo.payment.service.impl;

import dev.c9tech.fabo.payment.dto.PaymentWebhookPayload;
import dev.c9tech.fabo.payment.dto.VietQrRequest;
import dev.c9tech.fabo.payment.dto.VietQrResponse;
import dev.c9tech.fabo.payment.engine.VietQrGenerator;
import dev.c9tech.fabo.payment.event.PaymentCompletedEvent;
import dev.c9tech.fabo.payment.service.VietQrPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class VietQrPaymentServiceImpl implements VietQrPaymentService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    public static final String PAYMENT_COMPLETED_TOPIC = "payment.completed";
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(?i)(?:FABO|ORD|INV)[-_\\s]?(\\w+)");

    @Override
    public VietQrResponse generateVietQr(VietQrRequest request) {
        int width = request.getWidth() != null ? request.getWidth() : 350;
        int height = request.getHeight() != null ? request.getHeight() : 350;

        String amountStr = request.getAmount() != null 
                ? request.getAmount().toBigInteger().toString() 
                : "";

        try {
            String rawPayload = VietQrGenerator.generatePayload(
                    true,
                    request.getBnbBin(),
                    request.getConsumerId(),
                    request.isCard(),
                    amountStr,
                    request.getBillNumber(),
                    request.getPurpose()
            );

            String crc = rawPayload.substring(rawPayload.length() - 4);
            String base64Image = VietQrGenerator.generateQrBase64Png(rawPayload, width, height);

            return VietQrResponse.builder()
                    .qrRawPayload(rawPayload)
                    .qrBase64Image(base64Image)
                    .crc(crc)
                    .amount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO)
                    .bnbBin(request.getBnbBin())
                    .consumerId(request.getConsumerId())
                    .billNumber(request.getBillNumber())
                    .purpose(request.getPurpose())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi sinh mã VietQR: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi sinh mã VietQR Napas: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> processWebhook(PaymentWebhookPayload payload) {
        log.info("Xử lý IPN biến động số dư: amount={}, ref={}, content={}",
                payload.getAmount(), payload.getTransactionId(), payload.getContent());

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

        try {
            kafkaTemplate.send(PAYMENT_COMPLETED_TOPIC, event.getOrderId(), event);
            log.info("Đã phát Kafka event payment.completed cho orderId={}", event.getOrderId());
        } catch (Exception e) {
            log.warn("Kafka không sẵn sàng khi gửi payment event: {}", e.getMessage());
        }

        return Map.of(
                "success", true,
                "message", "Payment IPN processed and dispatched to Kafka topic",
                "orderId", event.getOrderId() != null ? event.getOrderId() : ""
        );
    }
}
