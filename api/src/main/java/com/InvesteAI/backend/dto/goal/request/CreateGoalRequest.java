package com.InvesteAI.backend.dto.goal.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

/**
 * Request payload for creating a new financial goal.
 *
 * @param title         goal title or name
 * @param name          alias field for title
 * @param category      optional category description
 * @param description   optional detailed description
 * @param currentAmount optional initial accumulated amount
 * @param currentValue  alias field for currentAmount
 * @param targetAmount  target monetary objective (must be >= 0.01)
 * @param targetValue   alias field for targetAmount
 * @param startDate     goal start date
 * @param deadline      goal target deadline
 * @param endDate       alias field for deadline
 */
public record CreateGoalRequest(
        String title,
        String name, // Alias for title
        String category,
        String description,
        BigDecimal currentAmount,
        BigDecimal currentValue,
        BigDecimal targetAmount,
        BigDecimal targetValue,
        LocalDate startDate,
        LocalDate deadline,
        LocalDate endDate,
        String progressMode,
        Set<UUID> holdingIds
) {
    public CreateGoalRequest(String title, String name, String category, String description, BigDecimal currentAmount,
                             BigDecimal currentValue, BigDecimal targetAmount, BigDecimal targetValue, LocalDate startDate,
                             LocalDate deadline, LocalDate endDate) {
        this(title, name, category, description, currentAmount, currentValue, targetAmount, targetValue,
                startDate, deadline, endDate, null, null);
    }

    /**
     * Resolves the goal name from name or title field.
     *
     * @return resolved name string
     */
    public String resolvedName() {
        if (name != null && !name.isBlank()) return name.trim();
        return title != null ? title.trim() : "";
    }

    /**
     * Resolves description from description or category field.
     *
     * @return resolved description or null
     */
    public String resolvedDescription() {
        if (description != null && !description.isBlank()) return description.trim();
        return category != null ? category.trim() : null;
    }

    /**
     * Resolves current progress value.
     *
     * @return non-null {@link BigDecimal} current value
     */
    public BigDecimal resolvedCurrentValue() {
        if (currentValue != null) return currentValue;
        if (currentAmount != null) return currentAmount;
        return BigDecimal.ZERO;
    }

    /**
     * Resolves target goal value.
     *
     * @return non-null {@link BigDecimal} target value
     */
    public BigDecimal resolvedTargetValue() {
        if (targetValue != null) return targetValue;
        return targetAmount;
    }

    /**
     * Resolves goal deadline / end date.
     *
     * @return {@link LocalDate} deadline or null
     */
    public LocalDate resolvedEndDate() {
        if (endDate != null) return endDate;
        return deadline;
    }

    /**
     * Resolves goal initiation date, falling back to current date.
     *
     * @return non-null {@link LocalDate} start date
     */
    public LocalDate resolvedStartDate() {
        return startDate != null ? startDate : LocalDate.now();
    }
}
