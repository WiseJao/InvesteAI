package com.InvesteAI.backend.dto.goal.request;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for updating an existing financial goal.
 *
 * @param title         optional updated title
 * @param name          optional updated name
 * @param category      optional updated category
 * @param description   optional updated description
 * @param currentAmount optional updated accumulated amount
 * @param currentValue  optional updated current value
 * @param targetAmount  optional updated target objective
 * @param targetValue   optional updated target value
 * @param startDate     optional updated start date
 * @param deadline      optional updated deadline
 * @param endDate       alias field for deadline
 */
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
    /**
     * Resolves the updated name if provided.
     *
     * @return resolved name string or null
     */
    public String resolvedName() {
        if (name != null) return name.trim();
        if (title != null) return title.trim();
        return null;
    }

    /**
     * Resolves the updated description if provided.
     *
     * @return resolved description or null
     */
    public String resolvedDescription() {
        if (description != null) return description.trim();
        if (category != null) return category.trim();
        return null;
    }

    /**
     * Resolves the updated current value if provided.
     *
     * @return resolved current value or null
     */
    public BigDecimal resolvedCurrentValue() {
        if (currentValue != null) return currentValue;
        return currentAmount;
    }

    /**
     * Resolves the updated target value if provided.
     *
     * @return resolved target value or null
     */
    public BigDecimal resolvedTargetValue() {
        if (targetValue != null) return targetValue;
        return targetAmount;
    }

    /**
     * Resolves the updated deadline / end date if provided.
     *
     * @return resolved {@link LocalDate} deadline or null
     */
    public LocalDate resolvedEndDate() {
        if (endDate != null) return endDate;
        return deadline;
    }
}
