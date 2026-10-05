package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dining_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable {

    @Id
    private String id; // e.g. "T01-01"

    @Column(nullable = false)
    private String tableName; // "Bàn 1"

    @Column(nullable = false)
    private String areaId; // "Tầng 1", "Sân Vườn", "VIP"

    @Column(nullable = false)
    private String areaName;

    @Column(nullable = false)
    private String branchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status;

    private Integer capacity;

    private String activeOrderId;

    private LocalDateTime lastStatusChange;

    public enum TableStatus {
        EMPTY,       // Bàn trống
        OCCUPIED,    // Đang có khách
        RESERVED,    // Đặt trước
        CLEANING     // Chờ dọn dẹp
    }
}
