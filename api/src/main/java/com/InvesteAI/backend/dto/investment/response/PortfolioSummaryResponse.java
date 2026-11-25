package com.InvesteAI.backend.dto.investment.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Summary metrics and asset class breakdown for a user's total investment portfolio.
 *
 * @param totalInvested     total acquisition cost basis across all active positions
 * @param currentTotalValue total mark-to-market valuation
 * @param totalProfit       aggregate profit or loss across the portfolio
 * @param profitPercentage  aggregate profit percentage
 * @param totalAssets       total count of active holding lots
 * @param distribution      allocation percentages by asset category
 * @param holdings          list of individual position details
 */
public record PortfolioSummaryResponse(
        BigDecimal totalInvested,
        BigDecimal currentTotalValue,
        BigDecimal totalProfit,
        Double profitPercentage,
        int totalAssets,
        List<AssetAllocation> distribution,
        List<HoldingResponse> holdings
) {
    /**
     * Asset class distribution entry.
     *
     * @param category   asset class name (e.g. Ações, FIIs, Renda Fixa)
     * @param value      total valuation allocated to this category
     * @param percentage percentage of total portfolio represented by this category
     */
    public record AssetAllocation(
            String category,
            BigDecimal value,
            Double percentage
    ) {}
}
