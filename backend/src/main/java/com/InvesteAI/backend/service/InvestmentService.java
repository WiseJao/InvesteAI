package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.investment.request.CreateHoldingRequest;
import com.InvesteAI.backend.dto.investment.request.UpdateHoldingRequest;
import com.InvesteAI.backend.dto.investment.response.HoldingResponse;
import com.InvesteAI.backend.dto.investment.response.PortfolioSummaryResponse;
import com.InvesteAI.backend.interfaces.InvestmentInterface;
import com.InvesteAI.backend.model.Investment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Service managing user portfolio holdings, equity valuations, and asset class distributions.
 * <p>
 * Handles asset CRUD operations, computes total invested capital, current valuations based on
 * live prices, aggregate profit/loss metrics, and categorizes assets into high-level asset classes.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentInterface investmentRepository;

    /**
     * Adds a new investment holding to a user's portfolio.
     *
     * @param userId  the UUID of the authenticated user
     * @param request the holding creation payload
     * @return {@link HoldingResponse} representing the registered holding
     */
    @Transactional
    public HoldingResponse addHolding(UUID userId, CreateHoldingRequest request) {
        Investment investment = new Investment();
        investment.setUserId(userId);
        investment.setSymbol(request.symbol().trim().toUpperCase());
        investment.setName(request.resolvedName());
        investment.setOriginalQuantity(request.resolvedQuantity());
        investment.setRemainingQuantity(request.resolvedQuantity());
        investment.setPurchaseUnitPrice(request.resolvedPurchasePrice());
        investment.setCurrentPrice(request.currentPrice() != null ? request.currentPrice() : request.resolvedPurchasePrice());
        investment.setPurchaseDate(request.resolvedPurchaseDate());

        Investment saved = investmentRepository.save(investment);
        return HoldingResponse.from(saved);
    }

    /**
     * Lists all registered investment holdings belonging to a user, ordered by purchase date descending.
     *
     * @param userId the UUID of the user
     * @return list of {@link HoldingResponse} items
     */
    @Transactional(readOnly = true)
    public List<HoldingResponse> listHoldings(UUID userId) {
        return investmentRepository.findAllByUserIdOrderByPurchaseDateDesc(userId)
                .stream()
                .map(HoldingResponse::from)
                .toList();
    }

    /**
     * Retrieves a single investment holding by ID, ensuring user ownership.
     *
     * @param userId the UUID of the user
     * @param id     the UUID of the investment holding
     * @return the {@link HoldingResponse}
     * @throws NoSuchElementException if the holding is not found or not owned by user
     */
    @Transactional(readOnly = true)
    public HoldingResponse getHolding(UUID userId, UUID id) {
        Investment investment = investmentRepository.findByInvestmentIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Ativo de investimento não encontrado"));
        return HoldingResponse.from(investment);
    }

    /**
     * Updates an existing investment holding in the user's portfolio.
     *
     * @param userId  the UUID of the user
     * @param id      the UUID of the holding to update
     * @param request the update payload
     * @return the updated {@link HoldingResponse}
     * @throws NoSuchElementException if the holding is not found or not owned by user
     */
    @Transactional
    public HoldingResponse updateHolding(UUID userId, UUID id, UpdateHoldingRequest request) {
        Investment investment = investmentRepository.findByInvestmentIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Ativo de investimento não encontrado"));

        if (request.symbol() != null) {
            investment.setSymbol(request.symbol().trim().toUpperCase());
        }
        if (request.name() != null) {
            investment.setName(request.name().trim());
        }
        if (request.resolvedQuantity() != null) {
            investment.setRemainingQuantity(request.resolvedQuantity());
        }
        if (request.resolvedPurchasePrice() != null) {
            investment.setPurchaseUnitPrice(request.resolvedPurchasePrice());
        }
        if (request.currentPrice() != null) {
            investment.setCurrentPrice(request.currentPrice());
        }
        if (request.purchaseDate() != null) {
            investment.setPurchaseDate(request.purchaseDate());
        }

        Investment saved = investmentRepository.save(investment);
        return HoldingResponse.from(saved);
    }

    /**
     * Deletes an investment holding from the user's portfolio.
     *
     * @param userId the UUID of the user
     * @param id     the UUID of the holding to delete
     * @throws NoSuchElementException if the holding is not found or not owned by user
     */
    @Transactional
    public void deleteHolding(UUID userId, UUID id) {
        Investment investment = investmentRepository.findByInvestmentIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Ativo de investimento não encontrado"));
        investmentRepository.delete(investment);
    }

    /**
     * Computes the aggregated portfolio summary for a user, including total invested capital,
     * total market value, net profit/loss, profit percentage, and asset allocation percentages.
     *
     * @param userId the UUID of the user
     * @return {@link PortfolioSummaryResponse} containing overall portfolio KPIs and asset allocation
     */
    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary(UUID userId) {
        List<Investment> holdings = investmentRepository.findAllByUserIdOrderByPurchaseDateDesc(userId);

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentTotalValue = BigDecimal.ZERO;

        Map<String, BigDecimal> categoryMap = new HashMap<>();

        List<HoldingResponse> holdingResponses = new ArrayList<>();
        for (Investment inv : holdings) {
            HoldingResponse hr = HoldingResponse.from(inv);
            holdingResponses.add(hr);

            totalInvested = totalInvested.add(hr.totalInvested());
            currentTotalValue = currentTotalValue.add(hr.currentTotalValue());

            String category = classifyAsset(inv.getSymbol());
            categoryMap.put(category, categoryMap.getOrDefault(category, BigDecimal.ZERO).add(hr.currentTotalValue()));
        }

        BigDecimal totalProfit = currentTotalValue.subtract(totalInvested);
        Double profitPct = 0.0;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitPct = totalProfit.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        List<PortfolioSummaryResponse.AssetAllocation> distribution = new ArrayList<>();
        BigDecimal finalCurrentTotalValue = currentTotalValue;
        categoryMap.forEach((categoryName, val) -> {
            Double pct = 0.0;
            if (finalCurrentTotalValue.compareTo(BigDecimal.ZERO) > 0) {
                pct = val.divide(finalCurrentTotalValue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            distribution.add(new PortfolioSummaryResponse.AssetAllocation(categoryName, val, pct));
        });

        return new PortfolioSummaryResponse(
                totalInvested,
                currentTotalValue,
                totalProfit,
                profitPct,
                holdings.size(),
                distribution,
                holdingResponses
        );
    }

    /**
     * Classifies an asset symbol into an asset category (Ações, Fundos Imobiliários, Renda Fixa, etc.).
     *
     * @param symbol the ticker or identifier string
     * @return category description string
     */
    private String classifyAsset(String symbol) {
        if (symbol == null) return "Outros";
        String s = symbol.trim().toUpperCase();
        if (s.endsWith("11")) return "Fundos Imobiliários / ETFs";
        if (s.endsWith("3") || s.endsWith("4") || s.endsWith("5") || s.endsWith("6")) return "Ações";
        if (s.startsWith("TESOURO") || s.startsWith("CDB") || s.startsWith("LCI") || s.startsWith("LCA") || s.startsWith("DEB")) return "Renda Fixa";
        if (s.endsWith("34")) return "BDRs";
        return "Renda Variável";
    }
}
