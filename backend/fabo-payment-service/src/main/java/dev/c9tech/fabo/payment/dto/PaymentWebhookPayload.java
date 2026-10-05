package dev.c9tech.fabo.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookPayload {
    private String transactionId;       // Payment Gateway Transaction Reference
    private String bankName;            // Sender/Receiver Bank
    private String accountNumber;       // Beneficiary Account
    private BigDecimal amount;          // Transaction Amount
    private String content;             // Transfer description / remark (contains OrderId/BillNo)
    private String orderId;             // Parsed Order ID
    private String invoiceId;           // Parsed Invoice ID
    private String signature;           // Webhook HMAC signature
    private LocalDateTime transactionTime;
}
