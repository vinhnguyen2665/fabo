package dev.c9tech.fabo.inventory.dao;

import dev.c9tech.fabo.inventory.entity.Ingredient;
import java.util.List;
import java.util.Optional;

public interface IngredientDAO {
    List<Ingredient> findByBranchId(String branchId);
    Optional<Ingredient> findById(String id);
    Ingredient save(Ingredient ingredient);
}
