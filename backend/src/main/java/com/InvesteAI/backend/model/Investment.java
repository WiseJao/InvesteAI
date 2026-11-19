package com.InvesteAI.backend.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "investment")
@Getter
@Setter
@NoArgsConstructor
public class Investment {

    @Id
    @Column(name = "investment_id", nullable = false, updatable = false)
    private UUID investmentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 380)
    private String name;

    @Column(nullable = false, length = 25)
    private String symbol;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_unit_price", nullable = false, precision = 24, scale = 10)
    private BigDecimal purchaseUnitPrice;

    @Column(name = "original_quantity", nullable = false, precision = 24, scale = 10)
    private BigDecimal originalQuantity;

    @Column(name = "remaining_quantity", nullable = false, precision = 24, scale = 10)
    private BigDecimal remainingQuantity;

    @Column(name = "current_price", precision = 24, scale = 10)
    private BigDecimal currentPrice;

    @Column(name = "profit", insertable = false, updatable = false, precision = 49, scale = 20)
    private BigDecimal profit;

    @PrePersist
    public void prePersist() {
        if (investmentId == null) {
            investmentId = UuidCreator.getTimeOrderedEpoch();
        }
        if (purchaseDate == null) {
            purchaseDate = LocalDate.now();
        }
        if (remainingQuantity == null) {
            remainingQuantity = originalQuantity;
        }
        if (currentPrice == null) {
            currentPrice = purchaseUnitPrice;
        }
    }
}
