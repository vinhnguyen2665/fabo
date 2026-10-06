package dev.c9tech.fabo.finance.service.impl;

import dev.c9tech.fabo.finance.dao.FinanceDAO;
import dev.c9tech.fabo.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final FinanceDAO financeDAO;

    @Override
    public Map<String, Object> getAnalyticsSummary(String branchId) {
        log.info("Lấy số liệu phân tích tài chính cho chi nhánh {}", branchId);
        return financeDAO.getAnalyticsSummary(branchId);
    }
}
