package com.InvesteAI.backend.dto.investment.request;

import com.InvesteAI.backend.model.InvestmentType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for updating an existing investment holding.
 *
 * @param symbol            optional updated ticker symbol
 * @param name              optional updated asset name
 * @param remainingQuantity optional updated remaining quantity
 * @param quantity          alias field for remainingQuantity
 * @param purchaseUnitPrice optional updated unit acquisition price
 * @param price             alias field for purchaseUnitPrice
 * @param purchaseDate      optional updated acquisition date
 * @param currentPrice      optional updated current market price
 */
public record UpdateHoldingRequest(
        String symbol,
        String name,
        BigDecimal remainingQuantity,
        BigDecimal quantity,
        BigDecimal purchaseUnitPrice,
        BigDecimal price,
        LocalDate purchaseDate,
        BigDecimal currentPrice,
        InvestmentType investmentType,
        BigDecimal annualRate
) {
    public UpdateHoldingRequest(String symbol, String name, BigDecimal remainingQuantity, BigDecimal quantity,
                                BigDecimal purchaseUnitPrice, BigDecimal price, LocalDate purchaseDate, BigDecimal currentPrice) {
        this(symbol, name, remainingQuantity, quantity, purchaseUnitPrice, price, purchaseDate, currentPrice, null, null);
    }
    /**
     * Resolves the quantity value if provided.
     *
     * @return resolved {@link BigDecimal} quantity or null
     */
    public BigDecimal resolvedQuantity() {
        if (remainingQuantity != null) return remainingQuantity;
        return quantity;
    }

    /**
     * Resolves the unit purchase price if provided.
     *
     * @return resolved {@link BigDecimal} price or null
     */
    public BigDecimal resolvedPurchasePrice() {
        if (purchaseUnitPrice != null) return purchaseUnitPrice;
        return price;
    }
}
