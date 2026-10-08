package dev.c9tech.fabo.pos.mapper;

import dev.c9tech.fabo.pos.dto.DiningTableDto;
import dev.c9tech.fabo.pos.entity.DiningTable;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DiningTableMapper {

    public static DiningTableDto toDto(DiningTable entity) {
        if (entity == null) {
            return null;
        }
        return DiningTableDto.builder()
                .id(entity.getId())
                .tableName(entity.getTableName())
                .areaId(entity.getAreaId())
                .areaName(entity.getAreaName())
                .branchId(entity.getBranchId())
                .status(entity.getStatus())
                .capacity(entity.getCapacity())
                .activeOrderId(entity.getActiveOrderId())
                .lastStatusChange(entity.getLastStatusChange())
                .posX(entity.getPosX())
                .posY(entity.getPosY())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .shape(entity.getShape())
                .rotation(entity.getRotation())
                .build();
    }

    public static List<DiningTableDto> toDtoList(List<DiningTable> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream().map(DiningTableMapper::toDto).collect(Collectors.toList());
    }

    public static DiningTable toEntity(DiningTableDto dto) {
        if (dto == null) {
            return null;
        }
        return DiningTable.builder()
                .id(dto.getId())
                .tableName(dto.getTableName())
                .areaId(dto.getAreaId())
                .areaName(dto.getAreaName())
                .branchId(dto.getBranchId())
                .status(dto.getStatus())
                .capacity(dto.getCapacity())
                .activeOrderId(dto.getActiveOrderId())
                .lastStatusChange(dto.getLastStatusChange())
                .posX(dto.getPosX())
                .posY(dto.getPosY())
                .width(dto.getWidth())
                .height(dto.getHeight())
                .shape(dto.getShape())
                .rotation(dto.getRotation())
                .build();
    }
}
