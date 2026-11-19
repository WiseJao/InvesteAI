package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for financial {@link Goal} entities.
 * <p>
 * Provides user-scoped lookup methods to query and manage personal goals.
 * </p>
 */
public interface GoalInterface extends JpaRepository<Goal, UUID> {

    /**
     * Lists all financial goals created by a user, ordered by start date descending.
     *
     * @param userId the UUID of the user
     * @return ordered list of {@link Goal} entities
     */
    List<Goal> findAllByUserIdOrderByStartDateDesc(UUID userId);

    /**
     * Finds a single financial goal by goal ID and user ID.
     *
     * @param goalId the UUID of the goal
     * @param userId the UUID of the owner user
     * @return an {@link Optional} containing the {@link Goal} if found
     */
    Optional<Goal> findByGoalIdAndUserId(UUID goalId, UUID userId);
}
