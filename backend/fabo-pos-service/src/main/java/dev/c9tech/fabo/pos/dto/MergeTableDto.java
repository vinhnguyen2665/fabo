package dev.c9tech.fabo.pos.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MergeTableDto {
    private String sourceTableId;
    private String targetTableId;
    private String cashierId;
}
