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
@Table(name = "goal")
@Getter
@Setter
@NoArgsConstructor
public class Goal {

    @Id
    @Column(name = "goal_id", nullable = false, updatable = false)
    private UUID goalId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "current_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "target_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "end_date")
    private LocalDate endDate;

    @PrePersist
    public void prePersist() {
        if (goalId == null) {
            goalId = UuidCreator.getTimeOrderedEpoch();
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (currentValue == null) {
            currentValue = BigDecimal.ZERO;
        }
    }
}
