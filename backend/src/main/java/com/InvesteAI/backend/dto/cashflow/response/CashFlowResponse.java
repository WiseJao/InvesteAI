package com.InvesteAI.backend.dto.cashflow.response;

import com.InvesteAI.backend.model.CashFlow;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

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
