package dev.c9tech.fabo.inventory.dao.impl;

import dev.c9tech.fabo.inventory.dao.IngredientDAO;
import dev.c9tech.fabo.inventory.entity.Ingredient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class IngredientDAOImpl implements IngredientDAO {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Ingredient> findByBranchId(String branchId) {
        if (branchId == null || branchId.isBlank()) {
            return entityManager.createQuery("SELECT i FROM Ingredient i", Ingredient.class)
                    .getResultList();
        }
        return entityManager.createQuery(
                "SELECT i FROM Ingredient i WHERE i.branchId = :branchId", Ingredient.class)
                .setParameter("branchId", branchId)
                .getResultList();
    }

    @Override
    public Optional<Ingredient> findById(String id) {
        return Optional.ofNullable(entityManager.find(Ingredient.class, id));
    }

    @Override
    public Ingredient save(Ingredient ingredient) {
        if (ingredient.getId() == null || entityManager.find(Ingredient.class, ingredient.getId()) == null) {
            entityManager.persist(ingredient);
            return ingredient;
        } else {
            return entityManager.merge(ingredient);
        }
    }
}
