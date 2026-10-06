package dev.c9tech.fabo.finance.dao.impl;

import dev.c9tech.fabo.finance.dao.FinanceDAO;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class FinanceDAOImpl implements FinanceDAO {

    @Override
    public Map<String, Object> getAnalyticsSummary(String branchId) {
        return Map.of(
                "todayGrossRevenue", BigDecimal.valueOf(14850000),
                "todayOrderCount", 78,
                "averageOrderValue", BigDecimal.valueOf(190384),
                "paymentBreakdown", Map.of(
                        "VIETQR", BigDecimal.valueOf(9850000),
                        "CASH", BigDecimal.valueOf(4200000),
                        "CARD", BigDecimal.valueOf(800000)
                ),
                "topSellingItems", List.of(
                        Map.of("name", "Phở Bò Tái Nạm Đặc Biệt", "quantity", 42, "revenue", 2730000),
                        Map.of("name", "Cà Phê Muối Xứ Huế", "quantity", 38, "revenue", 1330000),
                        Map.of("name", "Bún Chả Hà Nội Cổ Truyền", "quantity", 25, "revenue", 1500000)
                )
        );
    }
}
