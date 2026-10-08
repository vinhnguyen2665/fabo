package dev.c9tech.fabo.finance.dao;

import dev.c9tech.fabo.finance.dto.AnalyticsSummaryDto;

public interface FinanceDAO {
    AnalyticsSummaryDto getAnalyticsSummary(String branchId);
}
