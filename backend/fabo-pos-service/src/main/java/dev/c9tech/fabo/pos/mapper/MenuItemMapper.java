package dev.c9tech.fabo.pos.mapper;

import dev.c9tech.fabo.pos.dto.MenuItemDto;
import dev.c9tech.fabo.pos.dto.ModifierDto;
import dev.c9tech.fabo.pos.dto.ModifierGroupDto;
import dev.c9tech.fabo.pos.entity.MenuItem;
import dev.c9tech.fabo.pos.entity.Modifier;
import dev.c9tech.fabo.pos.entity.ModifierGroup;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MenuItemMapper {

    public static MenuItemDto toDto(MenuItem item, Map<String, String> categoryMap) {
        if (item == null) {
            return null;
        }

        List<ModifierGroupDto> modGroups = new ArrayList<>();
        if (item.getModifiers() != null) {
            for (ModifierGroup mg : item.getModifiers()) {
                List<ModifierDto> options = new ArrayList<>();
                if (mg.getOptions() != null) {
                    for (Modifier mod : mg.getOptions()) {
                        options.add(ModifierDto.builder()
                                .id(mod.getId())
                                .name(mod.getName())
                                .extraPrice(mod.getExtraPrice())
                                .build());
                    }
                }

                modGroups.add(ModifierGroupDto.builder()
                        .id(mg.getId())
                        .name(mg.getName())
                        .minSelect(mg.getMinSelect())
                        .maxSelect(mg.getMaxSelect())
                        .options(options)
                        .build());
            }
        }

        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .taxRate(item.getTaxRate())
                .category(categoryMap != null ? categoryMap.getOrDefault(item.getCategoryId(), "Món Khác") : "Món Khác")
                .imageUrl(item.getImageUrl())
                .isAvailable(item.getIsAvailable())
                .modifiers(modGroups)
                .build();
    }

    public static List<MenuItemDto> toDtoList(List<MenuItem> items, Map<String, String> categoryMap) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .map(item -> toDto(item, categoryMap))
                .collect(Collectors.toList());
    }
}
