package dev.c9tech.fabo.pos.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTableDto {
    private String id;
    private String tableName;
    private String areaId;
    private String areaName;
    private String branchId;
    private Integer capacity;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String shape;
}
