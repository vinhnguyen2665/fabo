package dev.c9tech.fabo.payment.controller;

import dev.c9tech.fabo.payment.dto.PaymentWebhookPayload;
import dev.c9tech.fabo.payment.dto.ResponseAPI;
import dev.c9tech.fabo.payment.service.VietQrPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentWebhookController {

    private final VietQrPaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseAPI<Map<String, Object>> handlePaymentWebhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody PaymentWebhookPayload payload
    ) {
        Map<String, Object> result = paymentService.processWebhook(payload);
        return ResponseAPI.success("Xử lý IPN thanh toán thành công", result);
    }
}
