package dev.c9tech.fabo.pos.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderDto {
    private String branchId;
    private String tableId;
    private String tableName;
    private String cashierId;
    private List<OrderItemDto> items;
    private BigDecimal orderDiscount;
    private BigDecimal serviceChargeRate;
    private boolean isTaxInclusive;
    private String note;
}
