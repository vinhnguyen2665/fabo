package dev.c9tech.fabo.inventory.repository;

import dev.c9tech.fabo.inventory.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, String> {

    /**
     * Executes atomic stock deduction with condition to prevent negative stock.
     * Returns number of rows updated (1 = success, 0 = insufficient stock / race condition prevented).
     */
    @Modifying
    @Query(value = "UPDATE ingredients SET current_stock = current_stock - :qty, updated_at = NOW() WHERE id = :id AND current_stock >= :qty", nativeQuery = true)
    int deductStockAtomic(@Param("id") String id, @Param("qty") BigDecimal qty);
}
