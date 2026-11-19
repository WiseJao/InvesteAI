package com.InvesteAI.backend.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity representing a financial or investment goal.
 * <p>
 * Stores the target amount, current accumulated amount, initiation date, target deadline,
 * and description of the user's objective.
 * </p>
 */
@Entity
@Table(name = "goal")
@Getter
@Setter
@NoArgsConstructor
public class Goal {

    /**
     * Unique identifier for the financial goal record.
     */
    @Id
    @Column(name = "goal_id", nullable = false, updatable = false)
    private UUID goalId;

    /**
     * The UUID of the user who owns this financial goal.
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Name or title of the goal (e.g. Reserva de Emergência, Carro Novo).
     */
    @Column(nullable = false)
    private String name;

    /**
     * Initiation or creation date of the goal.
     */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * Description or category context for the goal.
     */
    @Column(columnDefinition = "text")
    private String description;

    /**
     * Current accumulated progress value toward the target.
     */
    @Column(name = "current_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal currentValue;

    /**
     * Target monetary value to be achieved.
     */
    @Column(name = "target_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetValue;

    /**
     * Planned deadline or target end date.
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * Pre-persists default UUID, current date, and zero baseline if omitted.
     */
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
