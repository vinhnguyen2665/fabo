package dev.c9tech.fabo.pos.service.impl;

import dev.c9tech.fabo.pos.entity.*;
import dev.c9tech.fabo.pos.repository.MenuCategoryRepository;
import dev.c9tech.fabo.pos.repository.MenuItemRepository;
import dev.c9tech.fabo.pos.service.PosMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosMenuServiceImpl implements PosMenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public List<Map<String, Object>> getFullMenu(String branchId) {
        List<MenuCategory> categories = categoryRepository.findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(branchId);
        List<MenuItem> items = menuItemRepository.findByBranchIdAndIsAvailableTrue(branchId);

        Map<String, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(MenuCategory::getId, MenuCategory::getName, (a, b) -> a));

        List<Map<String, Object>> result = new ArrayList<>();
        for (MenuItem item : items) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("name", item.getName());
            map.put("price", item.getPrice());
            map.put("taxRate", item.getTaxRate());
            map.put("category", categoryMap.getOrDefault(item.getCategoryId(), "Món Khác"));
            map.put("imageUrl", item.getImageUrl());
            map.put("isAvailable", item.getIsAvailable());

            List<Map<String, Object>> modGroups = new ArrayList<>();
            if (item.getModifiers() != null) {
                for (ModifierGroup mg : item.getModifiers()) {
                    Map<String, Object> groupMap = new HashMap<>();
                    groupMap.put("id", mg.getId());
                    groupMap.put("name", mg.getName());
                    groupMap.put("minSelect", mg.getMinSelect());
                    groupMap.put("maxSelect", mg.getMaxSelect());

                    List<Map<String, Object>> options = new ArrayList<>();
                    if (mg.getOptions() != null) {
                        for (Modifier mod : mg.getOptions()) {
                            Map<String, Object> optMap = new HashMap<>();
                            optMap.put("id", mod.getId());
                            optMap.put("name", mod.getName());
                            optMap.put("extraPrice", mod.getExtraPrice());
                            options.add(optMap);
                        }
                    }
                    groupMap.put("options", options);
                    modGroups.add(groupMap);
                }
            }
            map.put("modifiers", modGroups);
            result.add(map);
        }
        return result;
    }
}
