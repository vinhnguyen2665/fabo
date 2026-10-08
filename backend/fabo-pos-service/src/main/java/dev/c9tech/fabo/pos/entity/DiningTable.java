package dev.c9tech.fabo.pos.entity;

import dev.c9tech.fabo.pos.enums.TableStatus;
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
    private String id; // e.g. "T01"

    @Column(name = "table_name", nullable = false)
    private String tableName; // "Bàn 1"

    @Column(name = "area_id", nullable = false)
    private String areaId; // "A1"

    @Column(name = "area_name", nullable = false)
    private String areaName;

    @Column(name = "branch_id", nullable = false)
    private String branchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status;

    private Integer capacity;

    @Column(name = "active_order_id")
    private String activeOrderId;

    @Column(name = "last_status_change")
    private LocalDateTime lastStatusChange;

    @Column(name = "pos_x")
    @Builder.Default
    private Integer posX = 50;

    @Column(name = "pos_y")
    @Builder.Default
    private Integer posY = 50;

    @Builder.Default
    private Integer width = 110;

    @Builder.Default
    private Integer height = 110;

    @Builder.Default
    private String shape = "RECTANGLE"; // RECTANGLE, ROUND, SQUARE

    @Builder.Default
    private Integer rotation = 0;
}
