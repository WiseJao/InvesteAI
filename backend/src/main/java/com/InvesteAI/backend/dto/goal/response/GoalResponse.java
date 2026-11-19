package com.InvesteAI.backend.dto.goal.response;

import com.InvesteAI.backend.model.Goal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

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
