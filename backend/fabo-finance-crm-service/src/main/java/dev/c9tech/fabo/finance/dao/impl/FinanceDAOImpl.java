package dev.c9tech.fabo.finance.dao.impl;

import dev.c9tech.fabo.finance.dao.FinanceDAO;
import dev.c9tech.fabo.finance.dto.AnalyticsSummaryDto;
import dev.c9tech.fabo.finance.dto.TopSellingItemDto;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class FinanceDAOImpl implements FinanceDAO {

    @Override
    public AnalyticsSummaryDto getAnalyticsSummary(String branchId) {
        return AnalyticsSummaryDto.builder()
                .todayGrossRevenue(BigDecimal.valueOf(14850000))
                .todayOrderCount(78)
                .averageOrderValue(BigDecimal.valueOf(190384))
                .paymentBreakdown(Map.of(
                        "VIETQR", BigDecimal.valueOf(9850000),
                        "CASH", BigDecimal.valueOf(4200000),
                        "CARD", BigDecimal.valueOf(800000)
                ))
                .topSellingItems(List.of(
                        TopSellingItemDto.builder().name("Phở Bò Tái Nạm Đặc Biệt").quantity(42).revenue(BigDecimal.valueOf(2730000)).build(),
                        TopSellingItemDto.builder().name("Cà Phê Muối Xứ Huế").quantity(38).revenue(BigDecimal.valueOf(1330000)).build(),
                        TopSellingItemDto.builder().name("Bún Chả Hà Nội Cổ Truyền").quantity(25).revenue(BigDecimal.valueOf(1500000)).build()
                ))
                .build();
    }
}
