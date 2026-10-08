package dev.c9tech.fabo.pos.dto;

import dev.c9tech.fabo.pos.enums.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiningTableDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String tableName;
    private String areaId;
    private String areaName;
    private String branchId;
    private TableStatus status;
    private Integer capacity;
    private String activeOrderId;
    private LocalDateTime lastStatusChange;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String shape;
    private Integer rotation;
}
