package dev.c9tech.fabo.inventory.service;

import dev.c9tech.fabo.inventory.entity.Ingredient;

import java.util.List;
import java.util.Map;

public interface InventoryService {
    List<Ingredient> getStock(String branchId);
    List<Map<String, Object>> getBomRecipes(String branchId);
}
