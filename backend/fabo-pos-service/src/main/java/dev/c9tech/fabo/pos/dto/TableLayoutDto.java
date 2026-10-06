package dev.c9tech.fabo.pos.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableLayoutDto {
    private String id;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String shape;
    private Integer rotation;
}
