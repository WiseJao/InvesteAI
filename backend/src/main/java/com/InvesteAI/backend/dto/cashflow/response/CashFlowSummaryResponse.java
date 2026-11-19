package com.InvesteAI.backend.dto.cashflow.response;

import java.math.BigDecimal;
import java.util.List;

public record CashFlowSummaryResponse(
        BigDecimal monthlyBudget,
        BigDecimal totalSpent,
        BigDecimal totalIncome,
        BigDecimal remainingBudget,
        List<CategoryBreakdown> categories
) {
    public record CategoryBreakdown(
            String name,
            BigDecimal spent,
            Double percentage
    ) {}
}
