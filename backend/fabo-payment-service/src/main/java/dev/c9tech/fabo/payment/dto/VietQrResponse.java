package dev.c9tech.fabo.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VietQrResponse {
    private String qrRawPayload;    // Raw TLV string (EMVCo)
    private String qrBase64Image;   // Base64 PNG image
    private String crc;             // 4-character hex CRC-16
    private BigDecimal amount;
    private String bnbBin;
    private String consumerId;
    private String purpose;
    private String billNumber;
}
