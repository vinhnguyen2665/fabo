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
public class VietQrRequest {
    private String bnbBin;          // Bank BIN (e.g. 970403 - Sacombank, 970436 - Vietcombank)
    private String consumerId;      // Account Number or Card Number
    private boolean isCard;         // False = Account (QRIBFTTA), True = Card (QRIBFTTC)
    private BigDecimal amount;      // Final payment amount after tax and discounts
    private String billNumber;      // Invoice/Order Bill Code
    private String purpose;         // Transaction remark (e.g. "FABO POS ORDER 1024")
    private Integer width;          // QR Code width (default 350)
    private Integer height;         // QR Code height (default 350)
}
