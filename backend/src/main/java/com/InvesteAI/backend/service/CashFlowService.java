package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.cashflow.request.CreateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.request.UpdateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowResponse;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowSummaryResponse;
import com.InvesteAI.backend.interfaces.CashFlowInterface;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.CashFlow;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.validation.PersistedFields;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service managing user income and expense records, category aggregations, and monthly budget summaries.
 * <p>
 * Handles CRUD operations scoped strictly to the authenticated user ID and calculates financial
 * metrics such as total spent, total income, remaining budget, and percentage breakdown per category.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class CashFlowService {

    private final CashFlowInterface cashFlowRepository;
    private final UserInterface userRepository;

    /**
     * Creates a new cash flow transaction for a user.
     *
     * @param userId  the UUID of the authenticated user
     * @param request the transaction payload
     * @return the created {@link CashFlowResponse}
     */
    @Transactional
    public CashFlowResponse create(UUID userId, CreateCashFlowRequest request) {
        CashFlow cashFlow = new CashFlow();
        cashFlow.setUserId(userId);
        cashFlow.setAmount(request.resolvedAmount());
        cashFlow.setFlowDate(request.resolvedDate());
        cashFlow.setDirection(request.resolvedDirection());
        cashFlow.setDescription(request.resolvedDescription());
        cashFlow.setCategory(request.category() != null ? request.category().trim() : "Outros");
        cashFlow.setClassification(request.resolvedClassification());

        validate(cashFlow, true, true, true);

        CashFlow saved = cashFlowRepository.save(cashFlow);
        return CashFlowResponse.from(saved);
    }

    /**
     * Lists cash flow records for a user with optional monthly range and type filtering.
     *
     * @param userId the UUID of the user
     * @param month  optional calendar month (1-12)
     * @param year   optional 4-digit calendar year
     * @param type   optional filter string (FIXED, VARIABLE, INCOME, EXPENSE)
     * @return list of {@link CashFlowResponse} entries
     */
    @Transactional(readOnly = true)
    public List<CashFlowResponse> list(UUID userId, Integer month, Integer year, String type) {
        List<CashFlow> list;
        if (month != null && year != null) {
            YearMonth ym = YearMonth.of(year, month);
            list = cashFlowRepository.findAllByUserIdAndDateRange(userId, ym.atDay(1), ym.atEndOfMonth());
        } else {
            list = cashFlowRepository.findAllByUserIdOrderByFlowDateDesc(userId);
        }

        if (type != null && !type.isBlank()) {
            String upper = type.toUpperCase();
            list = list.stream().filter(item -> {
                if (upper.contains("EXPENSE") && !"OUT".equalsIgnoreCase(item.getDirection())) {
                    return false;
                }
                if (upper.contains("FIXED") || upper.equals("FIXO")) {
                    return "FIXED".equalsIgnoreCase(item.getClassification());
                }
                if (upper.contains("VARIABLE") || upper.equals("VARIAVEL") || upper.equals("VARIÁVEL")) {
                    return "VARIABLE".equalsIgnoreCase(item.getClassification());
                }
                if (upper.contains("INCOME")) {
                    return "IN".equalsIgnoreCase(item.getDirection());
                }
                if (upper.contains("EXPENSE")) {
                    return "OUT".equalsIgnoreCase(item.getDirection());
                }
                return true;
            }).toList();
        }

        return list.stream().map(CashFlowResponse::from).toList();
    }

    /**
     * Retrieves a single cash flow entry by its ID, ensuring it belongs to the user.
     *
     * @param userId the UUID of the authenticated user
     * @param id     the UUID of the cash flow record
     * @return the {@link CashFlowResponse}
     * @throws NoSuchElementException if the record does not exist or does not belong to the user
     */
    @Transactional(readOnly = true)
    public CashFlowResponse getById(UUID userId, UUID id) {
        CashFlow cashFlow = cashFlowRepository.findByCashFlowIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Lançamento de fluxo de caixa não encontrado"));
        return CashFlowResponse.from(cashFlow);
    }

    /**
     * Updates an existing cash flow record belonging to the authenticated user.
     *
     * @param userId  the UUID of the authenticated user
     * @param id      the UUID of the cash flow record to update
     * @param request the update fields payload
     * @return the updated {@link CashFlowResponse}
     * @throws NoSuchElementException if the record does not exist or does not belong to the user
     */
    @Transactional
    public CashFlowResponse update(UUID userId, UUID id, UpdateCashFlowRequest request) {
        CashFlow cashFlow = cashFlowRepository.findByCashFlowIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Lançamento de fluxo de caixa não encontrado"));

        if (request.resolvedAmount() != null) {
            cashFlow.setAmount(request.resolvedAmount());
        }
        if (request.resolvedDate() != null) {
            cashFlow.setFlowDate(request.resolvedDate());
        }
        if (request.resolvedDirection() != null) {
            cashFlow.setDirection(request.resolvedDirection());
        }
        if (request.resolvedDescription() != null) {
            cashFlow.setDescription(request.resolvedDescription());
        }
        if (request.category() != null) {
            cashFlow.setCategory(request.category().trim());
        }
        if (request.resolvedClassification() != null) {
            cashFlow.setClassification(request.resolvedClassification());
        }

        validate(cashFlow, request.resolvedAmount() != null, request.category() != null,
                request.resolvedDirection() != null || request.resolvedClassification() != null);

        CashFlow saved = cashFlowRepository.save(cashFlow);
        return CashFlowResponse.from(saved);
    }

    /**
     * Deletes a cash flow record belonging to the authenticated user.
     *
     * @param userId the UUID of the authenticated user
     * @param id     the UUID of the cash flow record to remove
     * @throws NoSuchElementException if the record does not exist or does not belong to the user
     */
    @Transactional
    public void delete(UUID userId, UUID id) {
        CashFlow cashFlow = cashFlowRepository.findByCashFlowIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Lançamento de fluxo de caixa não encontrado"));
        cashFlowRepository.delete(cashFlow);
    }

    private void validate(CashFlow flow, boolean amount, boolean category, boolean direction) {
        if (amount) PersistedFields.money(flow.getAmount(), true, "valor");
        if (category) PersistedFields.optionalText(flow.getCategory(), 100, "categoria");
        if (direction && (!("IN".equals(flow.getDirection()) || "OUT".equals(flow.getDirection()))
                || (flow.getClassification() != null && !("FIXED".equals(flow.getClassification())
                || "VARIABLE".equals(flow.getClassification())))
                || ("OUT".equals(flow.getDirection()) && flow.getClassification() == null))) {
            throw PersistedFields.invalid("direção ou classificação");
        }
    }

    /**
     * Calculates the monthly budget summary, total income, total spent, remaining balance,
     * and category distribution percentages for a user in a given month.
     *
     * @param userId the UUID of the user
     * @param month  optional month (defaults to current month)
     * @param year   optional year (defaults to current year)
     * @return {@link CashFlowSummaryResponse} containing financial KPIs and category breakdowns
     */
    @Transactional(readOnly = true)
    public CashFlowSummaryResponse getSummary(UUID userId, Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        List<CashFlow> entries = cashFlowRepository.findAllByUserIdAndDateRange(userId, ym.atDay(1), ym.atEndOfMonth());

        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalIncome = BigDecimal.ZERO;
        Map<String, BigDecimal> categorySpendMap = new HashMap<>();

        for (CashFlow entry : entries) {
            if ("OUT".equalsIgnoreCase(entry.getDirection())) {
                totalSpent = totalSpent.add(entry.getAmount());
                String cat = entry.getCategory() != null && !entry.getCategory().isBlank() ? entry.getCategory() : "Outros";
                categorySpendMap.put(cat, categorySpendMap.getOrDefault(cat, BigDecimal.ZERO).add(entry.getAmount()));
            } else if ("IN".equalsIgnoreCase(entry.getDirection())) {
                totalIncome = totalIncome.add(entry.getAmount());
            }
        }

        BigDecimal monthlyBudget = totalIncome;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getProfile() != null && userOpt.get().getProfile().getSalary() != null) {
            monthlyBudget = monthlyBudget.add(userOpt.get().getProfile().getSalary());
        }

        BigDecimal remainingBudget = monthlyBudget.subtract(totalSpent);

        List<CashFlowSummaryResponse.CategoryBreakdown> categoryBreakdowns = new ArrayList<>();
        BigDecimal finalTotalSpent = totalSpent;
        categorySpendMap.forEach((categoryName, amountSpent) -> {
            Double pct = 0.0;
            if (finalTotalSpent.compareTo(BigDecimal.ZERO) > 0) {
                pct = amountSpent.divide(finalTotalSpent, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            categoryBreakdowns.add(new CashFlowSummaryResponse.CategoryBreakdown(categoryName, amountSpent, pct));
        });

        categoryBreakdowns.sort((a, b) -> b.spent().compareTo(a.spent()));

        return new CashFlowSummaryResponse(
                monthlyBudget,
                totalSpent,
                totalIncome,
                remainingBudget,
                categoryBreakdowns
        );
    }
}
