package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.cashflow.request.CreateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.request.UpdateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowResponse;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowSummaryResponse;
import com.InvesteAI.backend.interfaces.CashFlowInterface;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.CashFlow;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doAnswer;

@ExtendWith(MockitoExtension.class)
class CashFlowServiceTest {

    @Mock
    private CashFlowInterface cashFlowRepository;

    @Mock
    private UserInterface userRepository;

    @InjectMocks
    private CashFlowService cashFlowService;

    @Test
    void createsCashFlowSuccessfully() {
        UUID userId = UUID.randomUUID();
        CreateCashFlowRequest request = new CreateCashFlowRequest(
                "Aluguel",
                "Apartamento",
                null,
                new BigDecimal("1200.00"),
                null,
                "OUT",
                "FIXED",
                "Moradia",
                "FIXED",
                LocalDate.of(2025, 9, 10),
                null
        );

        when(cashFlowRepository.save(any(CashFlow.class))).thenAnswer(inv -> {
            CashFlow cf = inv.getArgument(0);
            cf.prePersist();
            return cf;
        });

        CashFlowResponse response = cashFlowService.create(userId, request);

        assertNotNull(response.id());
        assertEquals("Aluguel - Apartamento", response.description());
        assertEquals(new BigDecimal("1200.00"), response.amount());
        assertEquals("OUT", response.direction());
        assertEquals("FIXED", response.classification());
        assertEquals("Moradia", response.category());
    }

    @Test
    void expenseFiltersExcludeIncomeWithTheSameClassification() {
        UUID userId = UUID.randomUUID();
        CashFlow income = new CashFlow();
        income.setDirection("IN");
        income.setClassification("VARIABLE");
        CashFlow variable = new CashFlow();
        variable.setDirection("OUT");
        variable.setClassification("VARIABLE");
        CashFlow fixed = new CashFlow();
        fixed.setDirection("OUT");
        fixed.setClassification("FIXED");
        when(cashFlowRepository.findAllByUserIdOrderByFlowDateDesc(userId))
                .thenReturn(List.of(income, variable, fixed));

        assertEquals(List.of(CashFlowResponse.from(variable)),
                cashFlowService.list(userId, null, null, "EXPENSE_VARIABLE"));
        assertEquals(List.of(CashFlowResponse.from(fixed)),
                cashFlowService.list(userId, null, null, "EXPENSE_FIXED"));
        assertEquals(2, cashFlowService.list(userId, null, null, "VARIABLE").size());
    }

    @Test
    void calculatesMonthlySummaryAndCategoryPercentages() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        Profile profile = new Profile();
        profile.setSalary(new BigDecimal("3000.00"));
        user.setProfile(profile);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        CashFlow rent = new CashFlow();
        rent.setAmount(new BigDecimal("1200.00"));
        rent.setDirection("OUT");
        rent.setCategory("Contas");

        CashFlow market = new CashFlow();
        market.setAmount(new BigDecimal("600.00"));
        market.setDirection("OUT");
        market.setCategory("Alimentação");

        when(cashFlowRepository.findAllByUserIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(rent, market));

        CashFlowSummaryResponse summary = cashFlowService.getSummary(userId, 9, 2025);

        assertEquals(new BigDecimal("3000.00"), summary.monthlyBudget());
        assertEquals(new BigDecimal("1800.00"), summary.totalSpent());
        assertEquals(new BigDecimal("1200.00"), summary.remainingBudget());
        assertEquals(2, summary.categories().size());

        CashFlowSummaryResponse.CategoryBreakdown contas = summary.categories().stream()
                .filter(c -> c.name().equals("Contas")).findFirst().orElseThrow();
        assertEquals(new BigDecimal("1200.00"), contas.spent());
        assertEquals(66.67, contas.percentage());
    }

    @Test
    void addsIncomeToSalaryAndAllowsNegativeBalanceWithoutSalary() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        Profile profile = new Profile();
        profile.setSalary(new BigDecimal("1000.00"));
        user.setProfile(profile);
        CashFlow income = new CashFlow();
        income.setDirection("IN");
        income.setAmount(new BigDecimal("200.00"));
        CashFlow expense = new CashFlow();
        expense.setDirection("OUT");
        expense.setAmount(new BigDecimal("300.00"));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cashFlowRepository.findAllByUserIdAndDateRange(userId, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 30)))
                .thenReturn(List.of(income, expense));

        CashFlowSummaryResponse summary = cashFlowService.getSummary(userId, 9, 2025);
        assertEquals(new BigDecimal("1200.00"), summary.monthlyBudget());
        assertEquals(new BigDecimal("900.00"), summary.remainingBudget());

        CashFlow salary = new CashFlow();
        salary.setDirection("IN");
        salary.setCategory("Salário");
        salary.setAmount(new BigDecimal("1100.00"));
        when(cashFlowRepository.findAllByUserIdAndDateRange(userId, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 30)))
                .thenReturn(List.of(income, salary, expense), List.of(income, expense));
        summary = cashFlowService.getSummary(userId, 9, 2025);
        assertEquals(new BigDecimal("1300.00"), summary.monthlyBudget());
        assertEquals(new BigDecimal("1300.00"), summary.totalIncome());

        profile.setSalary(null);
        summary = cashFlowService.getSummary(userId, 9, 2025);
        assertEquals(new BigDecimal("-100.00"), summary.remainingBudget());
    }

    @Test
    void summaryUsesRequestedUserAndMonthAndHandlesZeroSpending() {
        UUID userId = UUID.randomUUID();
        UUID otherUser = UUID.randomUUID();
        CashFlow income = new CashFlow();
        income.setDirection("IN");
        income.setAmount(new BigDecimal("50.00"));
        CashFlow zeroExpense = new CashFlow();
        zeroExpense.setDirection("OUT");
        zeroExpense.setAmount(BigDecimal.ZERO);
        when(cashFlowRepository.findAllByUserIdAndDateRange(userId, LocalDate.of(2024, 2, 1), LocalDate.of(2024, 2, 29)))
                .thenReturn(List.of(income, income, zeroExpense));

        CashFlowSummaryResponse summary = cashFlowService.getSummary(userId, 2, 2024);
        assertEquals(new BigDecimal("100.00"), summary.totalIncome());
        assertEquals(new BigDecimal("100.00"), summary.remainingBudget());
        assertEquals(0.0, summary.categories().get(0).percentage());
        assertEquals(BigDecimal.ZERO, cashFlowService.getSummary(otherUser, 2, 2024).remainingBudget());
        assertEquals(BigDecimal.ZERO, cashFlowService.getSummary(userId, 3, 2024).remainingBudget());
    }

    @Test
    void summaryReflectsCreateUpdateAndDelete() {
        UUID userId = UUID.randomUUID();
        List<CashFlow> entries = new ArrayList<>();
        when(cashFlowRepository.save(any(CashFlow.class))).thenAnswer(inv -> {
            CashFlow entry = inv.getArgument(0);
            if (!entries.contains(entry)) {
                entry.prePersist();
                entries.add(entry);
            }
            return entry;
        });
        when(cashFlowRepository.findAllByUserIdAndDateRange(userId, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 30)))
                .thenAnswer(inv -> entries);
        when(cashFlowRepository.findByCashFlowIdAndUserId(any(UUID.class), any(UUID.class)))
                .thenAnswer(inv -> entries.stream().filter(e -> e.getCashFlowId().equals(inv.getArgument(0)) && e.getUserId().equals(inv.getArgument(1))).findFirst());
        doAnswer(inv -> { entries.remove(inv.getArgument(0)); return null; }).when(cashFlowRepository).delete(any(CashFlow.class));

        var created = cashFlowService.create(userId, new CreateCashFlowRequest("Receita", null, null,
                new BigDecimal("100.00"), null, "IN", "INCOME", "Outros", null, LocalDate.of(2025, 9, 10), null));
        assertEquals(new BigDecimal("100.00"), cashFlowService.getSummary(userId, 9, 2025).remainingBudget());
        cashFlowService.update(userId, created.id(), new UpdateCashFlowRequest(null, null, null,
                new BigDecimal("75.00"), null, null, null, null, null, null, null));
        assertEquals(new BigDecimal("75.00"), cashFlowService.getSummary(userId, 9, 2025).remainingBudget());
        cashFlowService.delete(userId, created.id());
        assertEquals(BigDecimal.ZERO, cashFlowService.getSummary(userId, 9, 2025).remainingBudget());
    }
}
