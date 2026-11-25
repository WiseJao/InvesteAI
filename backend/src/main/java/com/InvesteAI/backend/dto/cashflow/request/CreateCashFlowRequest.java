package com.InvesteAI.backend.dto.cashflow.request;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for creating a new cash flow transaction.
 *
 * @param name           title or name of the expense/income
 * @param detail         additional context or specification
 * @param description    explicit description text
 * @param amount         monetary value (must be >= 0.01)
 * @param value          alias field for amount
 * @param direction      flow direction ('IN' or 'OUT')
 * @param type           composite type indicator (INCOME, FIXED, VARIABLE, EXPENSE_FIXED, etc.)
 * @param category       classification category (e.g. Moradia, Contas, Salário)
 * @param classification classification ('FIXED' or 'VARIABLE')
 * @param flowDate       transaction date
 * @param date           alias field for flowDate
 */
public record CreateCashFlowRequest(
        String name,
        String detail,
        String description,
        BigDecimal amount,
        BigDecimal value, // Alias for amount
        String direction, // 'IN' or 'OUT'
        String type, // 'FIXED', 'VARIABLE', 'INCOME', 'EXPENSE_FIXED', 'EXPENSE_VARIABLE'
        String category,
        String classification, // 'FIXED' or 'VARIABLE'
        LocalDate flowDate,
        LocalDate date // Alias for flowDate
) {
    /**
     * Resolves the monetary amount from either primary or alias field.
     *
     * @return non-null resolved {@link BigDecimal} amount
     */
    public BigDecimal resolvedAmount() {
        return amount != null ? amount : value;
    }

    /**
     * Resolves the flow date, falling back to current date if not provided.
     *
     * @return the resolved {@link LocalDate}
     */
    public LocalDate resolvedDate() {
        if (flowDate != null) return flowDate;
        if (date != null) return date;
        return LocalDate.now();
    }

    /**
     * Resolves description by formatting name, detail, and explicit description fields.
     *
     * @return resolved description string
     */
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

    /**
     * Resolves transaction direction ('IN' or 'OUT').
     *
     * @return resolved direction string
     */
    public String resolvedDirection() {
        if (direction != null && !direction.isBlank()) {
            return direction.trim().toUpperCase();
        }
        if (type != null && type.toUpperCase().contains("INCOME")) {
            return "IN";
        }
        return "OUT";
    }

    /**
     * Resolves classification ('FIXED' or 'VARIABLE').
     *
     * @return resolved classification string
     */
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
