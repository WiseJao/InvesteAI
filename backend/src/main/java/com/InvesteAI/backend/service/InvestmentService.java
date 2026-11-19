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

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentInterface investmentRepository;

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

    @Transactional(readOnly = true)
    public List<HoldingResponse> listHoldings(UUID userId) {
        return investmentRepository.findAllByUserIdOrderByPurchaseDateDesc(userId)
                .stream()
                .map(HoldingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public HoldingResponse getHolding(UUID userId, UUID id) {
        Investment investment = investmentRepository.findByInvestmentIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Ativo de investimento não encontrado"));
        return HoldingResponse.from(investment);
    }

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

    @Transactional
    public void deleteHolding(UUID userId, UUID id) {
        Investment investment = investmentRepository.findByInvestmentIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Ativo de investimento não encontrado"));
        investmentRepository.delete(investment);
    }

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
