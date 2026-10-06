package dev.c9tech.fabo.inventory.controller;

import dev.c9tech.fabo.inventory.dto.ResponseAPI;
import dev.c9tech.fabo.inventory.entity.Ingredient;
import dev.c9tech.fabo.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock")
    public ResponseAPI<List<Ingredient>> getStock(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<Ingredient> stock = inventoryService.getStock(branchId);
        ResponseAPI<List<Ingredient>> response = ResponseAPI.success(stock);
        response.setRecordsTotal((long) stock.size());
        return response;
    }

    @GetMapping("/bom")
    public ResponseAPI<List<Map<String, Object>>> getBomRecipes(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<Map<String, Object>> recipes = inventoryService.getBomRecipes(branchId);
        ResponseAPI<List<Map<String, Object>>> response = ResponseAPI.success(recipes);
        response.setRecordsTotal((long) recipes.size());
        return response;
    }
}
