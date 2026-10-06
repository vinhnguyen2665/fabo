package dev.c9tech.fabo.finance.controller;

import dev.c9tech.fabo.finance.dto.ResponseAPI;
import dev.c9tech.fabo.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/analytics/summary")
    public ResponseAPI<Map<String, Object>> getAnalyticsSummary(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        Map<String, Object> summary = financeService.getAnalyticsSummary(branchId);
        return ResponseAPI.success(summary);
    }
}
