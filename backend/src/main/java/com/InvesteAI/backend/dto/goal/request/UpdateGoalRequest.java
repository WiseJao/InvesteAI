package com.InvesteAI.backend.dto.goal.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateGoalRequest(
        String title,
        String name,
        String category,
        String description,
        BigDecimal currentAmount,
        BigDecimal currentValue,
        BigDecimal targetAmount,
        BigDecimal targetValue,
        LocalDate startDate,
        LocalDate deadline,
        LocalDate endDate
) {
    public String resolvedName() {
        if (name != null) return name.trim();
        if (title != null) return title.trim();
        return null;
    }

    public String resolvedDescription() {
        if (description != null) return description.trim();
        if (category != null) return category.trim();
        return null;
    }

    public BigDecimal resolvedCurrentValue() {
        if (currentValue != null) return currentValue;
        return currentAmount;
    }

    public BigDecimal resolvedTargetValue() {
        if (targetValue != null) return targetValue;
        return targetAmount;
    }

    public LocalDate resolvedEndDate() {
        if (endDate != null) return endDate;
        return deadline;
    }
}
