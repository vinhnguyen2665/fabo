package dev.c9tech.fabo.pos.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayInvoiceDto {
    private String paymentMethod; // CASH, VIETQR, CARD
    private String cashierId;
    private String cashierName;
    private BigDecimal receivedCash;
    private BigDecimal changeCash;
    private Boolean eInvoiceRequested;
    private String buyerTaxCode;
    private String buyerCompanyName;
    private String buyerEmail;
}
