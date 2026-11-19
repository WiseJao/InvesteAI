package com.InvesteAI.backend.dto.cashflow.request;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for partially updating a cash flow transaction.
 *
 * @param name           optional updated name
 * @param detail         optional updated detail text
 * @param description    optional updated explicit description
 * @param amount         optional updated monetary value
 * @param value          alias field for amount
 * @param direction      optional updated direction ('IN' or 'OUT')
 * @param type           composite type indicator (e.g. INCOME, FIXED, VARIABLE)
 * @param category       optional updated category
 * @param classification optional updated classification ('FIXED' or 'VARIABLE')
 * @param flowDate       optional updated transaction date
 * @param date           alias field for flowDate
 */
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
    /**
     * Resolves the monetary amount if provided.
     *
     * @return resolved amount or null
     */
    public BigDecimal resolvedAmount() {
        return amount != null ? amount : value;
    }

    /**
     * Resolves the transaction date if provided.
     *
     * @return resolved {@link LocalDate} or null
     */
    public LocalDate resolvedDate() {
        if (flowDate != null) return flowDate;
        return date;
    }

    /**
     * Resolves description text if provided.
     *
     * @return resolved description or null
     */
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

    /**
     * Resolves transaction direction if provided.
     *
     * @return resolved direction or null
     */
    public String resolvedDirection() {
        if (direction != null && !direction.isBlank()) return direction.trim().toUpperCase();
        if (type != null && type.toUpperCase().contains("INCOME")) return "IN";
        return null;
    }

    /**
     * Resolves transaction classification if provided.
     *
     * @return resolved classification or null
     */
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
