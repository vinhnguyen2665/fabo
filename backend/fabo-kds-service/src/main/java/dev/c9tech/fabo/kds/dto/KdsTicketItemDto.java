package dev.c9tech.fabo.kds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KdsTicketItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String menuItemId;
    private String itemName;
    private Integer quantity;
    private String note;
    private String status;
    private String modifiersText;
}
