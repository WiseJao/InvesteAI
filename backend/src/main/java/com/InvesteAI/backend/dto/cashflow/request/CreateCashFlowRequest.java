package com.InvesteAI.backend.dto.cashflow.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCashFlowRequest(
        String name,
        String detail,
        String description,
        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
        BigDecimal amount,
        BigDecimal value, // Alias for amount
        String direction, // 'IN' or 'OUT'
        String type, // 'FIXED', 'VARIABLE', 'INCOME', 'EXPENSE_FIXED', 'EXPENSE_VARIABLE'
        String category,
        String classification, // 'FIXED' or 'VARIABLE'
        LocalDate flowDate,
        LocalDate date // Alias for flowDate
) {
    public BigDecimal resolvedAmount() {
        return amount != null ? amount : value;
    }

    public LocalDate resolvedDate() {
        if (flowDate != null) return flowDate;
        if (date != null) return date;
        return LocalDate.now();
    }

    public String resolvedDescription() {
        if (description != null && !description.isBlank()) return description.trim();
        if (name != null && !name.isBlank()) {
            if (detail != null && !detail.isBlank()) {
                return name.trim() + " - " + detail.trim();
            }
            return name.trim();
        }
        return detail != null ? detail.trim() : null;
    }

    public String resolvedDirection() {
        if (direction != null && !direction.isBlank()) {
            return direction.trim().toUpperCase();
        }
        if (type != null && type.toUpperCase().contains("INCOME")) {
            return "IN";
        }
        return "OUT";
    }

    public String resolvedClassification() {
        if (classification != null && !classification.isBlank()) {
            return classification.trim().toUpperCase();
        }
        if (type != null) {
            String upper = type.toUpperCase();
            if (upper.contains("FIXED") || upper.equals("FIXO")) return "FIXED";
            if (upper.contains("VARIABLE") || upper.equals("VARIAVEL") || upper.equals("VARIÁVEL")) return "VARIABLE";
        }
        return "VARIABLE";
    }
}
