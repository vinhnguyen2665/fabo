package dev.c9tech.fabo.kds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KdsTicketDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String orderId;
    private String branchId;
    private String tableId;
    private String tableName;
    private String orderTime;
    private List<KdsTicketItemDto> items;
    private String status;
}
