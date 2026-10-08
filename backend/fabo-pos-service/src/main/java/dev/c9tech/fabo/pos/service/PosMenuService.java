package dev.c9tech.fabo.pos.service;

import dev.c9tech.fabo.pos.dto.MenuItemDto;

import java.util.List;

public interface PosMenuService {
    List<MenuItemDto> getFullMenu(String branchId);
}
