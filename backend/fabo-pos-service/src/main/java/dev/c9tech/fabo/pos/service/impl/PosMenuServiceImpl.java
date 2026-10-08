package dev.c9tech.fabo.pos.service.impl;

import dev.c9tech.fabo.pos.dto.MenuItemDto;
import dev.c9tech.fabo.pos.entity.MenuCategory;
import dev.c9tech.fabo.pos.entity.MenuItem;
import dev.c9tech.fabo.pos.mapper.MenuItemMapper;
import dev.c9tech.fabo.pos.repository.MenuCategoryRepository;
import dev.c9tech.fabo.pos.repository.MenuItemRepository;
import dev.c9tech.fabo.pos.service.PosMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosMenuServiceImpl implements PosMenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public List<MenuItemDto> getFullMenu(String branchId) {
        List<MenuCategory> categories = categoryRepository.findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(branchId);
        List<MenuItem> items = menuItemRepository.findByBranchIdAndIsAvailableTrue(branchId);

        Map<String, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(MenuCategory::getId, MenuCategory::getName, (a, b) -> a));

        return MenuItemMapper.toDtoList(items, categoryMap);
    }
}
