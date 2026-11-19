package com.InvesteAI.backend.dto.investment.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    public BigDecimal resolvedQuantity() {
        if (quantity != null) return quantity;
        return originalQuantity;
    }

    public BigDecimal resolvedPurchasePrice() {
        if (purchaseUnitPrice != null) return purchaseUnitPrice;
        return price;
    }

    public String resolvedName() {
        if (name != null && !name.isBlank()) return name.trim();
        return symbol.trim().toUpperCase();
    }

    public LocalDate resolvedPurchaseDate() {
        return purchaseDate != null ? purchaseDate : LocalDate.now();
    }
}
