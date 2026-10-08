package dev.c9tech.fabo.inventory.mapper;

import dev.c9tech.fabo.inventory.dto.IngredientDto;
import dev.c9tech.fabo.inventory.entity.Ingredient;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class IngredientMapper {

    public static IngredientDto toDto(Ingredient entity) {
        if (entity == null) {
            return null;
        }
        return IngredientDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .unit(entity.getUnit())
                .currentStock(entity.getCurrentStock())
                .minimumStock(entity.getMinimumStock())
                .movingAverageCost(entity.getMovingAverageCost())
                .branchId(entity.getBranchId())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static List<IngredientDto> toDtoList(List<Ingredient> list) {
        if (list == null) {
            return Collections.emptyList();
        }
        return list.stream().map(IngredientMapper::toDto).collect(Collectors.toList());
    }

    public static Ingredient toEntity(IngredientDto dto) {
        if (dto == null) {
            return null;
        }
        return Ingredient.builder()
                .id(dto.getId())
                .name(dto.getName())
                .unit(dto.getUnit())
                .currentStock(dto.getCurrentStock())
                .minimumStock(dto.getMinimumStock())
                .movingAverageCost(dto.getMovingAverageCost())
                .branchId(dto.getBranchId())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
