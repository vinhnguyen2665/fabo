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
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.getOrDefault("status", "COMPLETED");
        Map<String, Object> result = kdsService.updateTicketStatus(orderId, newStatus);
        return ResponseAPI.success("Cập nhật trạng thái vé thành công", result);
    }
}
