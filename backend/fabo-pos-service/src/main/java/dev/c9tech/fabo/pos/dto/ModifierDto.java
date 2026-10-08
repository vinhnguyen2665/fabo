package dev.c9tech.fabo.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModifierDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private BigDecimal extraPrice;
}
