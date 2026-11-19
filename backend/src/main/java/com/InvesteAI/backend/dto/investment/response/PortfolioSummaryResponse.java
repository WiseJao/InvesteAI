package com.InvesteAI.backend.dto.investment.response;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioSummaryResponse(
        BigDecimal totalInvested,
        BigDecimal currentTotalValue,
        BigDecimal totalProfit,
        Double profitPercentage,
        int totalAssets,
        List<AssetAllocation> distribution,
        List<HoldingResponse> holdings
) {
    public record AssetAllocation(
            String category,
            BigDecimal value,
            Double percentage
    ) {}
}
