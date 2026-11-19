package com.InvesteAI.backend.dto.cashflow.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateCashFlowRequest(
        String name,
        String detail,
        String description,
        BigDecimal amount,
        BigDecimal value,
        String direction,
        String type,
        String category,
        String classification,
        LocalDate flowDate,
        LocalDate date
) {
    public BigDecimal resolvedAmount() {
        return amount != null ? amount : value;
    }

    public LocalDate resolvedDate() {
        if (flowDate != null) return flowDate;
        return date;
    }

    public String resolvedDescription() {
        if (description != null) return description.trim();
        if (name != null) {
            if (detail != null && !detail.isBlank()) {
                return name.trim() + " - " + detail.trim();
            }
            return name.trim();
        }
        return detail != null ? detail.trim() : null;
    }

    public String resolvedDirection() {
        if (direction != null && !direction.isBlank()) return direction.trim().toUpperCase();
        if (type != null && type.toUpperCase().contains("INCOME")) return "IN";
        return null;
    }

    public String resolvedClassification() {
        if (classification != null && !classification.isBlank()) return classification.trim().toUpperCase();
        if (type != null) {
            String upper = type.toUpperCase();
            if (upper.contains("FIXED") || upper.equals("FIXO")) return "FIXED";
            if (upper.contains("VARIABLE") || upper.equals("VARIAVEL") || upper.equals("VARIÁVEL")) return "VARIABLE";
        }
        return null;
    }
}
