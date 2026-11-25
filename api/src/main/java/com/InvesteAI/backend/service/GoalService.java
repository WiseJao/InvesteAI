package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.goal.request.CreateGoalRequest;
import com.InvesteAI.backend.dto.goal.request.UpdateGoalRequest;
import com.InvesteAI.backend.dto.goal.response.GoalResponse;
import com.InvesteAI.backend.interfaces.GoalInterface;
import com.InvesteAI.backend.model.Goal;
import com.InvesteAI.backend.validation.PersistedFields;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import com.InvesteAI.backend.interfaces.InvestmentInterface;
import com.InvesteAI.backend.dto.investment.response.HoldingResponse;
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
    private final InvestmentInterface investmentRepository;
    private final InvestmentService investments;

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

        PersistedFields.text(goal.getName(), 255, "nome");
        PersistedFields.money(goal.getCurrentValue(), false, "valor atual");
        PersistedFields.money(goal.getTargetValue(), true, "valor alvo");
        PersistedFields.dates(goal.getStartDate(), goal.getEndDate());

        applyProgress(goal, request.progressMode(), request.holdingIds());
        Goal saved = goalRepository.save(goal);
        return responses(userId, List.of(saved)).getFirst();
    }

    /**
     * Lists all financial goals created by a user, ordered by start date descending.
     *
     * @param userId the UUID of the authenticated user
     * @return list of {@link GoalResponse} items
     */
    @Transactional(readOnly = true)
    public List<GoalResponse> list(UUID userId) {
        return responses(userId, goalRepository.findAllByUserIdOrderByStartDateDesc(userId));
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
        return responses(userId, List.of(goal)).getFirst();
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

        if (Boolean.TRUE.equals(request.clearEndDate()) && (request.endDate() != null || request.deadline() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível limpar e definir a data final simultaneamente");
        }

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
        if (Boolean.TRUE.equals(request.clearEndDate())) {
            goal.setEndDate(null);
        } else if (request.resolvedEndDate() != null) {
            goal.setEndDate(request.resolvedEndDate());
        }

        if (request.resolvedName() != null) PersistedFields.text(goal.getName(), 255, "nome");
        if (request.resolvedCurrentValue() != null) PersistedFields.money(goal.getCurrentValue(), false, "valor atual");
        if (request.resolvedTargetValue() != null) PersistedFields.money(goal.getTargetValue(), true, "valor alvo");
        if (request.startDate() != null || request.resolvedEndDate() != null || Boolean.TRUE.equals(request.clearEndDate())) {
            PersistedFields.dates(goal.getStartDate(), goal.getEndDate());
        }

        applyProgress(goal, request.progressMode(), request.holdingIds());
        Goal saved = goalRepository.save(goal);
        return responses(userId, List.of(saved)).getFirst();
    }

    private void applyProgress(Goal goal, String requestedMode, Set<UUID> requestedIds) {
        String mode = requestedMode == null ? goal.getProgressMode() : requestedMode;
        if (!Set.of("MANUAL", "PORTFOLIO").contains(mode)) throw PersistedFields.invalid("modo de progresso");
        if ("MANUAL".equals(mode)) {
            if (requestedIds != null && !requestedIds.isEmpty()) throw PersistedFields.invalid("posições da meta");
            goal.getHoldingIds().clear();
        } else {
            if (!"Investimentos".equals(goal.getDescription())) throw PersistedFields.invalid("categoria da meta");
            if (requestedIds != null) {
                if (requestedIds.isEmpty() || requestedIds.stream().anyMatch(Objects::isNull) ||
                        investmentRepository.findAllById(requestedIds).stream()
                                .filter(holding -> goal.getUserId().equals(holding.getUserId())).count() != requestedIds.size()) {
                    throw PersistedFields.invalid("posições da meta");
                }
                goal.getHoldingIds().clear();
                goal.getHoldingIds().addAll(requestedIds);
            } else if (!"PORTFOLIO".equals(goal.getProgressMode())) {
                throw PersistedFields.invalid("posições da meta");
            }
        }
        goal.setProgressMode(mode);
    }

    private List<GoalResponse> responses(UUID user, List<Goal> goals) {
        Set<UUID> ids = goals.stream().flatMap(goal -> goal.getHoldingIds().stream()).collect(Collectors.toSet());
        Map<UUID, HoldingResponse> holdings = ids.isEmpty() ? Map.of()
                : investments.listHoldings(user, ids).stream().collect(Collectors.toMap(HoldingResponse::id, Function.identity()));
        return goals.stream().map(goal -> response(goal, holdings)).toList();
    }

    private GoalResponse response(Goal goal, Map<UUID, HoldingResponse> holdings) {
        if (!"PORTFOLIO".equals(goal.getProgressMode())) return GoalResponse.from(goal);
        var linked = goal.getHoldingIds().stream().map(holdings::get).filter(Objects::nonNull).toList();
        if (linked.isEmpty()) return GoalResponse.from(goal, BigDecimal.ZERO, "UNLINKED");
        String status = List.of("UNAVAILABLE", "STALE", "ESTIMATED").stream()
                .filter(candidate -> linked.stream().anyMatch(holding -> candidate.equals(holding.priceStatus())))
                .findFirst().orElse("MARKET");
        BigDecimal value = linked.stream().map(HoldingResponse::currentTotalValue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return GoalResponse.from(goal, value, status);
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
