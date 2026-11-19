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

@Entity
@Table(name = "cash_flow")
@Getter
@Setter
@NoArgsConstructor
public class CashFlow {

    @Id
    @Column(name = "cash_flow_id", nullable = false, updatable = false)
    private UUID cashFlowId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "flow_date", nullable = false)
    private LocalDate flowDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String direction; // 'IN' or 'OUT'

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(length = 10)
    private String classification; // 'FIXED' or 'VARIABLE'

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
