package dev.c9tech.fabo.payment.controller;

import dev.c9tech.fabo.payment.dto.VietQrRequest;
import dev.c9tech.fabo.payment.dto.VietQrResponse;
import dev.c9tech.fabo.payment.engine.VietQrGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/vietqr/generate")
    public ResponseEntity<VietQrResponse> generateVietQr(@RequestBody VietQrRequest request) {
        try {
            int width = request.getWidth() != null ? request.getWidth() : 350;
            int height = request.getHeight() != null ? request.getHeight() : 350;

            String amountStr = request.getAmount() != null 
                    ? request.getAmount().toBigInteger().toString() 
                    : "";

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

            VietQrResponse response = VietQrResponse.builder()
                    .qrRawPayload(rawPayload)
                    .qrBase64Image(base64Image)
                    .crc(crc)
                    .amount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO)
                    .bnbBin(request.getBnbBin())
                    .consumerId(request.getConsumerId())
                    .billNumber(request.getBillNumber())
                    .purpose(request.getPurpose())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi sinh mã VietQR Napas: " + e.getMessage(), e);
        }
    }
}
