package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.investment.request.CreateHoldingRequest;
import com.InvesteAI.backend.dto.investment.response.HoldingResponse;
import com.InvesteAI.backend.dto.investment.response.PortfolioSummaryResponse;
import com.InvesteAI.backend.interfaces.InvestmentInterface;
import com.InvesteAI.backend.model.Investment;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvestmentServiceTest {

    @Mock
    private InvestmentInterface investmentRepository;

    @InjectMocks
    private InvestmentService investmentService;

    @Test
    void addsHoldingAndCalculatesTotalInvested() {
        UUID userId = UUID.randomUUID();
        CreateHoldingRequest request = new CreateHoldingRequest(
                "PETR4",
                "Petrobras PN",
                new BigDecimal("100"),
                null,
                new BigDecimal("35.00"),
                null,
                LocalDate.of(2025, 1, 10),
                new BigDecimal("38.50")
        );

        when(investmentRepository.save(any(Investment.class))).thenAnswer(inv -> {
            Investment i = inv.getArgument(0);
            i.prePersist();
            return i;
        });

        HoldingResponse response = investmentService.addHolding(userId, request);

        assertNotNull(response.id());
        assertEquals("PETR4", response.symbol());
        assertEquals(new BigDecimal("3500.00"), response.totalInvested());
        assertEquals(new BigDecimal("3850.00"), response.currentTotalValue());
        assertEquals(new BigDecimal("350.00"), response.profit());
        assertEquals(10.0, response.profitPercentage());
    }

    @Test
    void calculatesPortfolioSummaryAndAssetDistribution() {
        UUID userId = UUID.randomUUID();

        Investment stock = new Investment();
        stock.setSymbol("VALE3");
        stock.setName("Vale ON");
        stock.setOriginalQuantity(new BigDecimal("10"));
        stock.setRemainingQuantity(new BigDecimal("10"));
        stock.setPurchaseUnitPrice(new BigDecimal("60.00"));
        stock.setCurrentPrice(new BigDecimal("60.00"));
        stock.setPurchaseDate(LocalDate.now());

        Investment fii = new Investment();
        fii.setSymbol("HGLG11");
        fii.setName("CSHG Logística");
        fii.setOriginalQuantity(new BigDecimal("10"));
        fii.setRemainingQuantity(new BigDecimal("10"));
        fii.setPurchaseUnitPrice(new BigDecimal("160.00"));
        fii.setCurrentPrice(new BigDecimal("160.00"));
        fii.setPurchaseDate(LocalDate.now());

        when(investmentRepository.findAllByUserIdOrderByPurchaseDateDesc(userId))
                .thenReturn(List.of(stock, fii));

        PortfolioSummaryResponse summary = investmentService.getPortfolioSummary(userId);

        assertEquals(new BigDecimal("2200.00"), summary.totalInvested());
        assertEquals(new BigDecimal("2200.00"), summary.currentTotalValue());
        assertEquals(2, summary.totalAssets());
        assertEquals(2, summary.distribution().size());
    }
}
