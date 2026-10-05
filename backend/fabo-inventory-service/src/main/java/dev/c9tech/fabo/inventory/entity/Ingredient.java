package dev.c9tech.fabo.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    private String id; // e.g. "ING-BEEF-01"

    @Column(nullable = false)
    private String name; // "Thịt Bò Tái"

    @Column(nullable = false)
    private String unit; // "g", "ml", "qua"

    @Column(nullable = false)
    private BigDecimal currentStock;

    @Column(nullable = false)
    private BigDecimal minimumStock;

    private BigDecimal movingAverageCost; // Giá vốn MAC

    private String branchId;

    private LocalDateTime updatedAt;
}
