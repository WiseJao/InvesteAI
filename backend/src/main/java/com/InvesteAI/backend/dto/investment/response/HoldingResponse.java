package com.InvesteAI.backend.dto.investment.response;

import com.InvesteAI.backend.model.Investment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response payload representing an investment holding position with computed valuation and profit/loss.
 *
 * @param id                standard entity identifier
 * @param investmentId      database primary key UUID
 * @param symbol            ticker symbol
 * @param name              asset name
 * @param originalQuantity  original lot size
 * @param remainingQuantity current quantity held
 * @param purchaseUnitPrice unit acquisition price
 * @param currentPrice      current market price
 * @param totalInvested     total cost basis (purchaseUnitPrice * quantity)
 * @param currentTotalValue current market valuation (currentPrice * quantity)
 * @param profit            nominal profit or loss amount
 * @param profitPercentage  profit percentage relative to total invested
 * @param purchaseDate      acquisition date
 */
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
    /**
     * Converts an {@link Investment} entity to a {@link HoldingResponse} calculating valuations and profit.
     *
     * @param entity the source entity
     * @return initialized {@link HoldingResponse}
     */
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
