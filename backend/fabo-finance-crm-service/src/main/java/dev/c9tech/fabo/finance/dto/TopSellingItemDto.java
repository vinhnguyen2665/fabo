package dev.c9tech.fabo.finance.dto;

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
public class TopSellingItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private Integer quantity;
    private BigDecimal revenue;
}
