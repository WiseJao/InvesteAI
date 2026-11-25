package com.InvesteAI.backend.dto.cashflow.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Summary metrics response for monthly budget and expenses.
 *
 * @param monthlyBudget   current profile salary (or zero) plus recorded monthly income
 * @param totalSpent      total expenses recorded for the month
 * @param totalIncome     total income recorded for the month
 * @param remainingBudget remaining available budget (monthlyBudget - totalSpent)
 * @param categories      breakdown of expenses per category
 */
public record CashFlowSummaryResponse(
        BigDecimal monthlyBudget,
        BigDecimal totalSpent,
        BigDecimal totalIncome,
        BigDecimal remainingBudget,
        List<CategoryBreakdown> categories
) {
    /**
     * Category expense breakdown item.
     *
     * @param name       category name
     * @param spent      total amount spent in this category
     * @param percentage percentage of total spending represented by this category
     */
    public record CategoryBreakdown(
            String name,
            BigDecimal spent,
            Double percentage
    ) {}
}
