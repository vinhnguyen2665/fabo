package dev.c9tech.fabo.hrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    private String userId;
    private String userName;

    @Column(nullable = false)
    private String action; // ORDER_CANCEL, DISCOUNT_APPLY, INVOICE_VOID

    @Column(nullable = false)
    private String entityName;

    private String entityId;

    @Column(columnDefinition = "jsonb")
    private String snapshotBefore;

    @Column(columnDefinition = "jsonb")
    private String snapshotAfter;

    private String ipAddress;
    private LocalDateTime createdAt;
}
