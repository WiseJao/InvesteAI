package com.InvesteAI.backend.dto.investment.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for registering a new asset holding in the user's portfolio.
 *
 * @param symbol            ticker symbol (e.g. PETR4, VALE3)
 * @param name              optional asset or company name
 * @param quantity          number of shares or units acquired
 * @param originalQuantity  alias field for quantity
 * @param purchaseUnitPrice unit acquisition price
 * @param price             alias field for purchaseUnitPrice
 * @param purchaseDate      trade execution date
 * @param currentPrice      optional current price override
 */
public record CreateHoldingRequest(
        @NotBlank(message = "O ticker/símbolo é obrigatório")
        String symbol,
        String name,
        @NotNull(message = "A quantidade é obrigatória")
        @DecimalMin(value = "0.0000000001", message = "A quantidade deve ser maior que zero")
        BigDecimal quantity,
        BigDecimal originalQuantity,
        @NotNull(message = "O preço de compra é obrigatório")
        @DecimalMin(value = "0.0", message = "O preço de compra deve ser maior ou igual a zero")
        BigDecimal purchaseUnitPrice,
        BigDecimal price, // Alias for purchaseUnitPrice
        LocalDate purchaseDate,
        BigDecimal currentPrice
) {
    /**
     * Resolves the quantity purchased.
     *
     * @return non-null {@link BigDecimal} quantity
     */
    public BigDecimal resolvedQuantity() {
        if (quantity != null) return quantity;
        return originalQuantity;
    }

    /**
     * Resolves the purchase unit price.
     *
     * @return non-null {@link BigDecimal} price
     */
    public BigDecimal resolvedPurchasePrice() {
        if (purchaseUnitPrice != null) return purchaseUnitPrice;
        return price;
    }

    /**
     * Resolves asset name, defaulting to uppercase symbol.
     *
     * @return non-null asset name string
     */
    public String resolvedName() {
        if (name != null && !name.isBlank()) return name.trim();
        return symbol.trim().toUpperCase();
    }

    /**
     * Resolves purchase date, falling back to current date.
     *
     * @return non-null {@link LocalDate} purchase date
     */
    public LocalDate resolvedPurchaseDate() {
        return purchaseDate != null ? purchaseDate : LocalDate.now();
    }
}
