package dev.c9tech.fabo.kds.controller;

import dev.c9tech.fabo.kds.dto.KdsTicketDto;
import dev.c9tech.fabo.kds.dto.ResponseAPI;
import dev.c9tech.fabo.kds.service.KdsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/kds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KdsController {

    private final KdsService kdsService;

    @GetMapping("/tickets")
    public ResponseAPI<List<KdsTicketDto>> getTickets(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<KdsTicketDto> tickets = kdsService.getTickets(branchId);
        ResponseAPI<List<KdsTicketDto>> response = ResponseAPI.success(tickets);
        response.setRecordsTotal((long) tickets.size());
        return response;
    }

    @PutMapping("/tickets/{orderId}/status")
    public ResponseAPI<Map<String, Object>> updateTicketStatus(
            @PathVariable String orderId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String itemId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String targetStatus = status;
        String targetItemId = itemId;
        if (body != null) {
            if (targetStatus == null || targetStatus.isBlank()) {
                targetStatus = body.get("status");
            }
            if (targetItemId == null || targetItemId.isBlank()) {
                targetItemId = body.get("itemId");
            }
        }
        if (targetStatus == null || targetStatus.isBlank()) {
            throw new IllegalArgumentException("Trạng thái vé (status) không được để trống");
        }

        Map<String, Object> result = kdsService.updateTicketStatus(orderId, targetStatus, targetItemId);
        return ResponseAPI.success("Cập nhật trạng thái vé thành công", result);
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseAPI<Map<String, Object>> updateItemStatus(
            @PathVariable String itemId,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String targetStatus = status;
        if ((targetStatus == null || targetStatus.isBlank()) && body != null) {
            targetStatus = body.get("status");
        }
        if (targetStatus == null || targetStatus.isBlank()) {
            throw new IllegalArgumentException("Trạng thái món (status) không được để trống");
        }

        Map<String, Object> result = kdsService.updateItemStatus(itemId, targetStatus);
        return ResponseAPI.success("Cập nhật trạng thái món thành công", result);
    }

    @PutMapping("/tickets/{orderId}/complete-items")
    public ResponseAPI<Map<String, Object>> completeAllItems(@PathVariable String orderId) {
        Map<String, Object> result = kdsService.completeAllItems(orderId);
        return ResponseAPI.success("Đã hoàn thành toàn bộ món trên vé", result);
    }

    @PostMapping("/tickets/{orderId}/call-waiter")
    public ResponseAPI<Map<String, Object>> callWaiter(@PathVariable String orderId) {
        Map<String, Object> result = kdsService.callWaiter(orderId);
        return ResponseAPI.success("Đã phát thông báo gọi phục vụ bưng món", result);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(org.springframework.http.HttpStatus.BAD_REQUEST)
    public ResponseAPI<Void> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Yêu cầu không hợp lệ: {}", ex.getMessage());
        return ResponseAPI.error(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage());
    }
}
