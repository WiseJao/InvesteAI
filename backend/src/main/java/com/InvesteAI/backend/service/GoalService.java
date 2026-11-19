package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.goal.request.CreateGoalRequest;
import com.InvesteAI.backend.dto.goal.request.UpdateGoalRequest;
import com.InvesteAI.backend.dto.goal.response.GoalResponse;
import com.InvesteAI.backend.interfaces.GoalInterface;
import com.InvesteAI.backend.model.Goal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Service managing financial targets, investment goals, and milestone tracking.
 * <p>
 * Handles goal persistence, updating accumulated amounts, recalculating progress percentages,
 * and deleting user goals within strict user-isolation boundaries.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalInterface goalRepository;

    /**
     * Creates a new financial goal for a user.
     *
     * @param userId  the UUID of the authenticated user
     * @param request the goal creation payload
     * @return {@link GoalResponse} representing the newly created goal
     */
    @Transactional
    public GoalResponse create(UUID userId, CreateGoalRequest request) {
        Goal goal = new Goal();
        goal.setUserId(userId);
        goal.setName(request.resolvedName());
        goal.setDescription(request.resolvedDescription());
        goal.setCurrentValue(request.resolvedCurrentValue());
        goal.setTargetValue(request.resolvedTargetValue());
        goal.setStartDate(request.resolvedStartDate());
        goal.setEndDate(request.resolvedEndDate());

        Goal saved = goalRepository.save(goal);
        return GoalResponse.from(saved);
    }

    /**
     * Lists all financial goals created by a user, ordered by start date descending.
     *
     * @param userId the UUID of the authenticated user
     * @return list of {@link GoalResponse} items
     */
    @Transactional(readOnly = true)
    public List<GoalResponse> list(UUID userId) {
        return goalRepository.findAllByUserIdOrderByStartDateDesc(userId)
                .stream()
                .map(GoalResponse::from)
                .toList();
    }

    /**
     * Retrieves a single financial goal by ID, ensuring ownership by the user.
     *
     * @param userId the UUID of the authenticated user
     * @param id     the UUID of the goal
     * @return the {@link GoalResponse}
     * @throws NoSuchElementException if the goal is not found or does not belong to the user
     */
    @Transactional(readOnly = true)
    public GoalResponse getById(UUID userId, UUID id) {
        Goal goal = goalRepository.findByGoalIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Objetivo financeiro não encontrado"));
        return GoalResponse.from(goal);
    }

    /**
     * Updates fields on an existing financial goal.
     *
     * @param userId  the UUID of the authenticated user
     * @param id      the UUID of the goal to update
     * @param request the update payload
     * @return the updated {@link GoalResponse}
     * @throws NoSuchElementException if the goal is not found or does not belong to the user
     */
    @Transactional
    public GoalResponse update(UUID userId, UUID id, UpdateGoalRequest request) {
        Goal goal = goalRepository.findByGoalIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Objetivo financeiro não encontrado"));

        if (request.resolvedName() != null) {
            goal.setName(request.resolvedName());
        }
        if (request.resolvedDescription() != null) {
            goal.setDescription(request.resolvedDescription());
        }
        if (request.resolvedCurrentValue() != null) {
            goal.setCurrentValue(request.resolvedCurrentValue());
        }
        if (request.resolvedTargetValue() != null) {
            goal.setTargetValue(request.resolvedTargetValue());
        }
        if (request.startDate() != null) {
            goal.setStartDate(request.startDate());
        }
        if (request.resolvedEndDate() != null) {
            goal.setEndDate(request.resolvedEndDate());
        }

        Goal saved = goalRepository.save(goal);
        return GoalResponse.from(saved);
    }

    /**
     * Deletes a financial goal belonging to the authenticated user.
     *
     * @param userId the UUID of the authenticated user
     * @param id     the UUID of the goal to delete
     * @throws NoSuchElementException if the goal is not found or does not belong to the user
     */
    @Transactional
    public void delete(UUID userId, UUID id) {
        Goal goal = goalRepository.findByGoalIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Objetivo financeiro não encontrado"));
        goalRepository.delete(goal);
    }
}
