package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.cashflow.request.CreateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.request.UpdateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowResponse;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowSummaryResponse;
import com.InvesteAI.backend.interfaces.CashFlowInterface;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.CashFlow;
import com.InvesteAI.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashFlowService {

    private final CashFlowInterface cashFlowRepository;
    private final UserInterface userRepository;

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

        CashFlow saved = cashFlowRepository.save(cashFlow);
        return CashFlowResponse.from(saved);
    }

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

    @Transactional(readOnly = true)
    public CashFlowResponse getById(UUID userId, UUID id) {
        CashFlow cashFlow = cashFlowRepository.findByCashFlowIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Lançamento de fluxo de caixa não encontrado"));
        return CashFlowResponse.from(cashFlow);
    }

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

        CashFlow saved = cashFlowRepository.save(cashFlow);
        return CashFlowResponse.from(saved);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        CashFlow cashFlow = cashFlowRepository.findByCashFlowIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Lançamento de fluxo de caixa não encontrado"));
        cashFlowRepository.delete(cashFlow);
    }

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

        BigDecimal monthlyBudget = BigDecimal.ZERO;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getProfile() != null && userOpt.get().getProfile().getSalary() != null) {
            monthlyBudget = userOpt.get().getProfile().getSalary();
        } else if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            monthlyBudget = totalIncome;
        } else {
            monthlyBudget = totalSpent;
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
