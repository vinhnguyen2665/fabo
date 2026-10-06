package dev.c9tech.fabo.inventory.service.impl;

import dev.c9tech.fabo.inventory.dao.IngredientDAO;
import dev.c9tech.fabo.inventory.entity.Ingredient;
import dev.c9tech.fabo.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final IngredientDAO ingredientDAO;

    @Override
    public List<Ingredient> getStock(String branchId) {
        log.info("Lấy danh sách tồn kho cho chi nhánh {}", branchId);
        return ingredientDAO.findByBranchId(branchId);
    }

    @Override
    public List<Map<String, Object>> getBomRecipes(String branchId) {
        log.info("Lấy danh sách công thức định lượng (BOM) cho chi nhánh {}", branchId);
        return List.of(
                Map.of(
                        "menuItemId", "M01",
                        "menuItemName", "Phở Bò Tái Nạm Đặc Biệt",
                        "items", List.of(
                                Map.of("ingredientName", "Bánh Phở Tươi", "quantity", 0.15, "unit", "kg"),
                                Map.of("ingredientName", "Thịt Bò Tái Hoa", "quantity", 0.10, "unit", "kg")
                        )
                ),
                Map.of(
                        "menuItemId", "M04",
                        "menuItemName", "Cà Phê Muối Xứ Huế",
                        "items", List.of(
                                Map.of("ingredientName", "Cà Phê Hạt Robusta Rang Mộc", "quantity", 0.025, "unit", "kg"),
                                Map.of("ingredientName", "Sữa Đặc Ngôi Sao Phương Nam", "quantity", 0.08, "unit", "lon")
                        )
                )
        );
    }
}
