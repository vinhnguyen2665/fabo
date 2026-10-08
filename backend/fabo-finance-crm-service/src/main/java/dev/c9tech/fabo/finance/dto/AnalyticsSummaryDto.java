package dev.c9tech.fabo.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private BigDecimal todayGrossRevenue;
    private Integer todayOrderCount;
    private BigDecimal averageOrderValue;
    private Map<String, BigDecimal> paymentBreakdown;
    private List<TopSellingItemDto> topSellingItems;
}
