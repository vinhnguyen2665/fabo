package dev.c9tech.fabo.payment.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEvent {
    private String eventId;
    private String orderId;
    private String invoiceId;
    private String branchId;
    private BigDecimal amount;
    private String paymentMethod;       // VIETQR, CASH, CARD
    private String transactionRef;
    private Instant completedAt;
}
