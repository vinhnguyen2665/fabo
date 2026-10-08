package dev.c9tech.fabo.inventory.service;

import dev.c9tech.fabo.inventory.dto.IngredientDto;

import java.util.List;
import java.util.Map;

public interface InventoryService {
    List<IngredientDto> getStock(String branchId);
    List<Map<String, Object>> getBomRecipes(String branchId);
}
