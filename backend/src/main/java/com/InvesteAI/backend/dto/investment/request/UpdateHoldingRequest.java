package com.InvesteAI.backend.dto.investment.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateHoldingRequest(
        String symbol,
        String name,
        BigDecimal remainingQuantity,
        BigDecimal quantity,
        BigDecimal purchaseUnitPrice,
        BigDecimal price,
        LocalDate purchaseDate,
        BigDecimal currentPrice
) {
    public BigDecimal resolvedQuantity() {
        if (remainingQuantity != null) return remainingQuantity;
        return quantity;
    }

    public BigDecimal resolvedPurchasePrice() {
        if (purchaseUnitPrice != null) return purchaseUnitPrice;
        return price;
    }
}
