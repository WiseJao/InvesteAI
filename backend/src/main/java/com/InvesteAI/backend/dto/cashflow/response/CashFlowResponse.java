package com.InvesteAI.backend.dto.cashflow.response;

import com.InvesteAI.backend.model.CashFlow;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response payload representing a cash flow transaction with backwards-compatible alias fields.
 *
 * @param id             standard entity identifier
 * @param cashFlowId     database primary key UUID
 * @param flowDate       transaction calendar date
 * @param date           alias field for flowDate
 * @param amount         monetary value
 * @param value          alias field for amount
 * @param direction      flow direction ('IN' or 'OUT')
 * @param description    description text
 * @param name           alias field for description
 * @param category       category tag
 * @param classification classification ('FIXED' or 'VARIABLE')
 * @param type           alias field for classification
 */
public record CashFlowResponse(
        UUID id,
        UUID cashFlowId,
        LocalDate flowDate,
        LocalDate date,
        BigDecimal amount,
        BigDecimal value,
        String direction,
        String description,
        String name,
        String category,
        String classification,
        String type
) {
    /**
     * Converts a {@link CashFlow} entity to its corresponding response DTO.
     *
     * @param entity the source entity
     * @return initialized {@link CashFlowResponse}
     */
    public static CashFlowResponse from(CashFlow entity) {
        return new CashFlowResponse(
                entity.getCashFlowId(),
                entity.getCashFlowId(),
                entity.getFlowDate(),
                entity.getFlowDate(),
                entity.getAmount(),
                entity.getAmount(),
                entity.getDirection(),
                entity.getDescription(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getClassification(),
                entity.getClassification()
        );
    }
}
