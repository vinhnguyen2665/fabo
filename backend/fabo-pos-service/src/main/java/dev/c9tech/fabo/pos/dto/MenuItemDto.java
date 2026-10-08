package dev.c9tech.fabo.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private BigDecimal price;
    private BigDecimal taxRate;
    private String category;
    private String imageUrl;
    private Boolean isAvailable;

    @Builder.Default
    private List<ModifierGroupDto> modifiers = new ArrayList<>();
}
