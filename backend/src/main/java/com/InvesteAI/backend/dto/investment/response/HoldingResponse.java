package com.InvesteAI.backend.dto.investment.response;

import com.InvesteAI.backend.model.Investment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

public record HoldingResponse(
        UUID id,
        UUID investmentId,
        String symbol,
        String name,
        BigDecimal originalQuantity,
        BigDecimal remainingQuantity,
        BigDecimal purchaseUnitPrice,
        BigDecimal currentPrice,
        BigDecimal totalInvested,
        BigDecimal currentTotalValue,
        BigDecimal profit,
        Double profitPercentage,
        LocalDate purchaseDate
) {
    public static HoldingResponse from(Investment entity) {
        BigDecimal qty = entity.getRemainingQuantity() != null ? entity.getRemainingQuantity() : entity.getOriginalQuantity();
        BigDecimal buyPrice = entity.getPurchaseUnitPrice();
        BigDecimal currPrice = entity.getCurrentPrice() != null ? entity.getCurrentPrice() : buyPrice;

        BigDecimal totalInvested = buyPrice.multiply(qty);
        BigDecimal currentTotal = currPrice.multiply(qty);
        BigDecimal profit = currentTotal.subtract(totalInvested);

        Double profitPct = 0.0;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitPct = profit.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return new HoldingResponse(
                entity.getInvestmentId(),
                entity.getInvestmentId(),
                entity.getSymbol(),
                entity.getName(),
                entity.getOriginalQuantity(),
                entity.getRemainingQuantity(),
                entity.getPurchaseUnitPrice(),
                entity.getCurrentPrice(),
                totalInvested,
                currentTotal,
                profit,
                profitPct,
                entity.getPurchaseDate()
        );
    }
}
