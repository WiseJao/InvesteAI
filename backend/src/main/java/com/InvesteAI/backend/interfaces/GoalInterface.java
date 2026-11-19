package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalInterface extends JpaRepository<Goal, UUID> {
    List<Goal> findAllByUserIdOrderByStartDateDesc(UUID userId);
    Optional<Goal> findByGoalIdAndUserId(UUID goalId, UUID userId);
}
