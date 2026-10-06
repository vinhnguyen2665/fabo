package dev.c9tech.fabo.payment.service;

import dev.c9tech.fabo.payment.dto.PaymentWebhookPayload;
import dev.c9tech.fabo.payment.dto.VietQrRequest;
import dev.c9tech.fabo.payment.dto.VietQrResponse;

import java.util.Map;

public interface VietQrPaymentService {
    VietQrResponse generateVietQr(VietQrRequest request);
    Map<String, Object> processWebhook(PaymentWebhookPayload payload);
}
