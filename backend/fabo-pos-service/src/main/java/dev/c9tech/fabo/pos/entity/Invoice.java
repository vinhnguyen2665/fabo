package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    private String id; // Invoice Code (e.g. "INV-20261006-0001")

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String branchId;

    private String tableId;

    private String tableName;

    private String cashierId;

    private String cashierName;

    @Column(nullable = false)
    private BigDecimal rawSubtotal;

    @Column(nullable = false)
    private BigDecimal totalDiscount;

    @Column(nullable = false)
    private BigDecimal serviceChargeAmount;

    @Column(nullable = false)
    private BigDecimal totalTax;

    @Column(nullable = false)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    private String paymentMethod; // VIETQR, CASH, CARD

    // Thông tin phục vụ xuất HĐĐT theo Thông tư 78/2021/TT-BTC
    private Boolean eInvoiceRequested;
    private String buyerTaxCode;
    private String buyerCompanyName;
    private String buyerEmail;
    private String buyerAddress;
    private String eInvoiceLookupCode;
    private String eInvoiceStatus; // DRAFT, ISSUED, FAILED

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public enum PaymentStatus {
        PENDING,
        PAID,
        CANCELLED,
        REFUNDED
    }
}
