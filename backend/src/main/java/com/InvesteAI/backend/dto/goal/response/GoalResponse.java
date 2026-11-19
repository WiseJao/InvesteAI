package com.InvesteAI.backend.dto.goal.response;

import com.InvesteAI.backend.model.Goal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response payload representing a financial goal with computed progress and backwards-compatible aliases.
 *
 * @param id                 standard entity identifier
 * @param goalId             database primary key UUID
 * @param name               goal name
 * @param title              alias field for name
 * @param description        goal description
 * @param category           alias field for description
 * @param currentValue       accumulated progress amount
 * @param currentAmount      alias field for currentValue
 * @param targetValue        target monetary amount
 * @param targetAmount       alias field for targetValue
 * @param progressPercentage computed completion percentage (0.0 - 100.0)
 * @param startDate          goal initiation date
 * @param endDate            goal target deadline
 * @param deadline           alias field for endDate
 */
public record GoalResponse(
        UUID id,
        UUID goalId,
        String name,
        String title,
        String description,
        String category,
        BigDecimal currentValue,
        BigDecimal currentAmount,
        BigDecimal targetValue,
        BigDecimal targetAmount,
        Double progressPercentage,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate deadline
) {
    /**
     * Converts a {@link Goal} entity into a {@link GoalResponse} with computed progress percentage.
     *
     * @param entity the goal entity
     * @return initialized {@link GoalResponse}
     */
    public static GoalResponse from(Goal entity) {
        Double progress = null;
        if (entity.getTargetValue() != null && entity.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal current = entity.getCurrentValue() != null ? entity.getCurrentValue() : BigDecimal.ZERO;
            progress = current.divide(entity.getTargetValue(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return new GoalResponse(
                entity.getGoalId(),
                entity.getGoalId(),
                entity.getName(),
                entity.getName(),
                entity.getDescription(),
                entity.getDescription(),
                entity.getCurrentValue(),
                entity.getCurrentValue(),
                entity.getTargetValue(),
                entity.getTargetValue(),
                progress,
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getEndDate()
        );
    }
}
