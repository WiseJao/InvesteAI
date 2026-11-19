package com.InvesteAI.backend.dto.goal.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalRequest(
        @NotBlank(message = "O título é obrigatório")
        String title,
        String name, // Alias for title
        String category,
        String description,
        BigDecimal currentAmount,
        BigDecimal currentValue,
        @NotNull(message = "O valor alvo é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor alvo deve ser maior que zero")
        BigDecimal targetAmount,
        BigDecimal targetValue,
        LocalDate startDate,
        LocalDate deadline,
        LocalDate endDate // Alias for deadline
) {
    public String resolvedName() {
        if (name != null && !name.isBlank()) return name.trim();
        return title != null ? title.trim() : "";
    }

    public String resolvedDescription() {
        if (description != null && !description.isBlank()) return description.trim();
        return category != null ? category.trim() : null;
    }

    public BigDecimal resolvedCurrentValue() {
        if (currentValue != null) return currentValue;
        if (currentAmount != null) return currentAmount;
        return BigDecimal.ZERO;
    }

    public BigDecimal resolvedTargetValue() {
        if (targetValue != null) return targetValue;
        return targetAmount;
    }

    public LocalDate resolvedEndDate() {
        if (endDate != null) return endDate;
        return deadline;
    }

    public LocalDate resolvedStartDate() {
        return startDate != null ? startDate : LocalDate.now();
    }
}
