package dev.c9tech.fabo.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private String unit;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private BigDecimal movingAverageCost;
    private String branchId;
    private LocalDateTime updatedAt;
}
