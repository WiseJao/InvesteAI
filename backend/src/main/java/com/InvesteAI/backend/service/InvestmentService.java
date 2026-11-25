package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.investment.request.CreateHoldingRequest;
import com.InvesteAI.backend.dto.investment.request.UpdateHoldingRequest;
import com.InvesteAI.backend.dto.investment.response.HoldingResponse;
import com.InvesteAI.backend.dto.investment.response.PortfolioSummaryResponse;
import com.InvesteAI.backend.interfaces.InvestmentInterface;
import com.InvesteAI.backend.model.Investment;
import com.InvesteAI.backend.model.InvestmentType;
import com.InvesteAI.backend.validation.PersistedFields;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
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
    private final BrapiService brapiService;

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
        investment.setCurrentPrice(request.currentPrice());
        investment.setPurchaseDate(request.resolvedPurchaseDate());
        investment.setInvestmentType(request.investmentType() == null ? InvestmentType.LEGACY : request.investmentType());
        investment.setAnnualRate(request.annualRate());
        validate(investment);

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
        return valueHoldings(investmentRepository.findAllByUserIdOrderByPurchaseDateDesc(userId));
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
        return valueHoldings(List.of(investment)).getFirst();
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
        if (request.investmentType() != null) {
            investment.setInvestmentType(request.investmentType());
            if (request.investmentType() != InvestmentType.FIXED_INCOME) investment.setAnnualRate(null);
        }
        if (request.annualRate() != null) investment.setAnnualRate(request.annualRate());
        validate(investment);

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

        List<HoldingResponse> holdingResponses = valueHoldings(holdings);
        for (HoldingResponse hr : holdingResponses) {

            totalInvested = totalInvested.add(hr.totalInvested());
            currentTotalValue = currentTotalValue.add(hr.currentTotalValue());

            String category = switch (hr.investmentType()) {
                case FIXED_INCOME -> "Renda Fixa";
                case VARIABLE_INCOME -> "Renda Variável";
                case LEGACY -> "Legado";
            };
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

    private List<HoldingResponse> valueHoldings(List<Investment> holdings) {
        List<String> tickers = holdings.stream()
                .filter(holding -> holding.getInvestmentType() == InvestmentType.VARIABLE_INCOME)
                .map(holding -> holding.getSymbol().toUpperCase(Locale.ROOT))
                .distinct().sorted().toList();
        Map<String, BrapiService.MarketPrice> quotes = new HashMap<>();
        if (!tickers.isEmpty()) {
            for (var quote : brapiService.getQuotes(tickers)) {
                quotes.put(quote.path("symbol").asText().toUpperCase(Locale.ROOT), BrapiService.MarketPrice.from(quote));
            }
        }
        Instant now = Instant.now();
        LocalDate valuationDate = now.atZone(ZoneId.of("America/Sao_Paulo")).toLocalDate();
        return holdings.stream().map(holding -> HoldingResponse.from(holding, valuationDate,
                holding.getInvestmentType() == InvestmentType.VARIABLE_INCOME
                        ? quotes.get(holding.getSymbol().toUpperCase(Locale.ROOT)) : null, now)).toList();
    }

    private void validate(Investment inv) {
        LocalDate today = LocalDate.now();
        PersistedFields.text(inv.getSymbol(), 25, "símbolo");
        PersistedFields.text(inv.getName(), 380, "nome");
        if (inv.getPurchaseDate() == null || inv.getPurchaseDate().isAfter(today)
                || inv.getPurchaseDate().isBefore(today.minusYears(100))) {
            throw badRequest("Símbolo, nome ou data de compra inválidos");
        }
        validateNumber(inv.getOriginalQuantity(), true, "quantidade original");
        validateNumber(inv.getRemainingQuantity(), false, "quantidade restante");
        validateNumber(inv.getPurchaseUnitPrice(), false, "preço de compra");
        if (inv.getCurrentPrice() != null) validateNumber(inv.getCurrentPrice(), false, "preço atual");
        if (inv.getRemainingQuantity().compareTo(inv.getOriginalQuantity()) > 0) {
            throw badRequest("Quantidade restante excede a quantidade original");
        }
        BigDecimal rate = inv.getAnnualRate();
        if (inv.getInvestmentType() == InvestmentType.FIXED_INCOME) {
            if (rate == null || rate.signum() < 0 || rate.compareTo(new BigDecimal("1000")) > 0
                    || rate.stripTrailingZeros().scale() > 4) throw badRequest("Taxa anual inválida");
        } else if (rate != null) {
            throw badRequest("Taxa anual permitida apenas para renda fixa");
        }
    }

    private void validateNumber(BigDecimal value, boolean positive, String field) {
        if (value == null || value.signum() < (positive ? 1 : 0)
                || value.stripTrailingZeros().scale() > 10
                || value.abs().compareTo(new BigDecimal("100000000000000")) >= 0) {
            throw badRequest("Valor inválido: " + field);
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
