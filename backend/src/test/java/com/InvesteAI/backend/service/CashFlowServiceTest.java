package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.cashflow.request.CreateCashFlowRequest;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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
}
