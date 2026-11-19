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

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalInterface goalRepository;

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

    @Transactional(readOnly = true)
    public List<GoalResponse> list(UUID userId) {
        return goalRepository.findAllByUserIdOrderByStartDateDesc(userId)
                .stream()
                .map(GoalResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse getById(UUID userId, UUID id) {
        Goal goal = goalRepository.findByGoalIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Objetivo financeiro não encontrado"));
        return GoalResponse.from(goal);
    }

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

    @Transactional
    public void delete(UUID userId, UUID id) {
        Goal goal = goalRepository.findByGoalIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Objetivo financeiro não encontrado"));
        goalRepository.delete(goal);
    }
}
