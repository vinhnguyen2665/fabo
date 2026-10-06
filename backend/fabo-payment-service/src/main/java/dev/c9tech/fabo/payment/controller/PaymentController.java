package dev.c9tech.fabo.payment.controller;

import dev.c9tech.fabo.payment.dto.ResponseAPI;
import dev.c9tech.fabo.payment.dto.VietQrRequest;
import dev.c9tech.fabo.payment.dto.VietQrResponse;
import dev.c9tech.fabo.payment.service.VietQrPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final VietQrPaymentService paymentService;

    @PostMapping("/vietqr/generate")
    public ResponseAPI<VietQrResponse> generateVietQr(@RequestBody VietQrRequest request) {
        try {
            VietQrResponse response = paymentService.generateVietQr(request);
            return ResponseAPI.success("Tạo mã VietQR thành công", response);
        } catch (Exception e) {
            log.error("Lỗi khi sinh mã VietQR: {}", e.getMessage(), e);
            return ResponseAPI.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi sinh mã VietQR Napas: " + e.getMessage());
        }
    }
}
