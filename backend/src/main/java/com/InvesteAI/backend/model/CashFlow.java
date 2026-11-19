package com.InvesteAI.backend.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity representing an income or expense cash flow transaction.
 * <p>
 * Stores monetary amounts, cash flow direction ('IN' for income, 'OUT' for expenses),
 * classification ('FIXED' vs 'VARIABLE'), category tags, and creation/update timestamps.
 * </p>
 */
@Entity
@Table(name = "cash_flow")
@Getter
@Setter
@NoArgsConstructor
public class CashFlow {

    /**
     * Unique identifier for the cash flow transaction.
     */
    @Id
    @Column(name = "cash_flow_id", nullable = false, updatable = false)
    private UUID cashFlowId;

    /**
     * The UUID of the owning user.
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Effective calendar date of the cash flow event.
     */
    @Column(name = "flow_date", nullable = false)
    private LocalDate flowDate;

    /**
     * Monetary transaction value.
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Transaction direction: 'IN' (income) or 'OUT' (expense).
     */
    @Column(nullable = false, length = 3)
    private String direction; // 'IN' or 'OUT'

    /**
     * Human-readable description or title of the transaction.
     */
    @Column(columnDefinition = "text")
    private String description;

    /**
     * Expense or income category (e.g. Moradia, Alimentação, Transporte, Salário).
     */
    @Column(length = 100)
    private String category;

    /**
     * Cost classification: 'FIXED' (recurring/fixed costs) or 'VARIABLE' (discretionary).
     */
    @Column(length = 10)
    private String classification; // 'FIXED' or 'VARIABLE'

    /**
     * UTC timestamp when the record was created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * UTC timestamp when the record was last modified.
     */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Pre-persists default UUID, timestamps, and default direction before insert.
     */
    @PrePersist
    public void prePersist() {
        if (cashFlowId == null) {
            cashFlowId = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
        if (direction == null) {
            direction = "OUT";
        }
    }

    /**
     * Updates the modification timestamp before update.
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
