package dev.c9tech.fabo.pos.controller;

import dev.c9tech.fabo.pos.dto.*;
import dev.c9tech.fabo.pos.entity.DiningTable;
import dev.c9tech.fabo.pos.service.DiningTableService;
import dev.c9tech.fabo.pos.service.PosMenuService;
import dev.c9tech.fabo.pos.service.PosOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final DiningTableService tableService;
    private final PosMenuService menuService;
    private final PosOrderService orderService;

    // -------------------------------------------------------------------------
    // 1. DINING TABLES & 2D FLOOR PLAN
    // -------------------------------------------------------------------------

    @GetMapping("/tables")
    public ResponseAPI<List<DiningTable>> getTables(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<DiningTable> tables = tableService.getTables(branchId);
        ResponseAPI<List<DiningTable>> response = ResponseAPI.success(tables);
        response.setRecordsTotal((long) tables.size());
        return response;
    }

    @PostMapping("/tables")
    public ResponseAPI<DiningTable> createTable(@RequestBody CreateTableDto dto) {
        DiningTable saved = tableService.createTable(dto);
        return ResponseAPI.success("Đã tạo bàn mới thành công", saved);
    }

    @DeleteMapping("/tables/{tableId}")
    public ResponseAPI<Map<String, Object>> deleteTable(@PathVariable String tableId) {
        tableService.deleteTable(tableId);
        return ResponseAPI.success("Đã xóa bàn thành công", Map.of("tableId", tableId, "status", "DELETED"));
    }

    @PutMapping("/tables/layout")
    public ResponseAPI<Map<String, Object>> updateTableLayout(
            @RequestBody List<TableLayoutDto> layouts
    ) {
        tableService.updateTableLayout(layouts);
        return ResponseAPI.success("Cập nhật bố cục 2D thành công", Map.of("status", "SUCCESS", "updatedCount", layouts.size()));
    }

    @PostMapping("/tables/transfer")
    public ResponseAPI<Map<String, Object>> transferTable(@RequestBody TransferTableDto dto) {
        Map<String, Object> result = tableService.transferTable(dto);
        return ResponseAPI.success("Chuyển bàn thành công", result);
    }

    @PostMapping("/tables/merge")
    public ResponseAPI<Map<String, Object>> mergeTable(@RequestBody MergeTableDto dto) {
        Map<String, Object> result = tableService.mergeTable(dto);
        return ResponseAPI.success("Gộp bàn thành công", result);
    }

    // -------------------------------------------------------------------------
    // 2. MENU & TOPPINGS
    // -------------------------------------------------------------------------

    @GetMapping("/menu")
    public ResponseAPI<List<Map<String, Object>>> getMenu(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<Map<String, Object>> menu = menuService.getFullMenu(branchId);
        ResponseAPI<List<Map<String, Object>>> response = ResponseAPI.success(menu);
        response.setRecordsTotal((long) menu.size());
        return response;
    }

    // -------------------------------------------------------------------------
    // 3. ORDERS & ACTIVE TABLE BILLING
    // -------------------------------------------------------------------------

    @GetMapping("/tables/{tableId}/order")
    public ResponseAPI<Map<String, Object>> getTableActiveOrder(@PathVariable String tableId) {
        Map<String, Object> order = orderService.getTableActiveOrder(tableId);
        return ResponseAPI.success(order);
    }

    @PostMapping("/orders")
    public ResponseAPI<Map<String, Object>> createOrder(@RequestBody CreateOrderDto dto) {
        Map<String, Object> result = orderService.createOrder(dto);
        return ResponseAPI.success("Tạo đơn hàng thành công", result);
    }

    @PostMapping("/invoices/{orderId}/pay")
    public ResponseAPI<Map<String, Object>> payInvoice(
            @PathVariable String orderId,
            @RequestBody PayInvoiceDto dto
    ) {
        Map<String, Object> result = orderService.payInvoice(orderId, dto);
        return ResponseAPI.success("Thanh toán thành công", result);
    }
}
