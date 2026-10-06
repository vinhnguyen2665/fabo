package dev.c9tech.fabo.finance.service;

import java.util.Map;

public interface FinanceService {
    Map<String, Object> getAnalyticsSummary(String branchId);
}
