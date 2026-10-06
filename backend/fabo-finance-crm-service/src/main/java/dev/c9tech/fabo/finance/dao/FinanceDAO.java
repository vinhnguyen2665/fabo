package dev.c9tech.fabo.finance.dao;

import java.util.Map;

public interface FinanceDAO {
    Map<String, Object> getAnalyticsSummary(String branchId);
}
