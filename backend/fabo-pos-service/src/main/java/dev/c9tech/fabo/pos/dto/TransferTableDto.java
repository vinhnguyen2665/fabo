package dev.c9tech.fabo.pos.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferTableDto {
    private String sourceTableId;
    private String targetTableId;
    private String cashierId;
}
