package dev.c9tech.fabo.finance.service;

import dev.c9tech.fabo.finance.dto.AnalyticsSummaryDto;

public interface FinanceService {
    AnalyticsSummaryDto getAnalyticsSummary(String branchId);
}
