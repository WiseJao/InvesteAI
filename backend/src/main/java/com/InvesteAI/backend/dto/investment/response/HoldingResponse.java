package com.InvesteAI.backend.dto.investment.response;

import com.InvesteAI.backend.model.Investment;
import com.InvesteAI.backend.dto.investment.request.FixedIncomeTerms;
import com.InvesteAI.backend.service.CdiService.Estimate;
import com.InvesteAI.backend.model.InvestmentType;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Instant;
import java.time.Duration;
import com.InvesteAI.backend.service.BrapiService.MarketPrice;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Response payload representing an investment holding position with computed valuation and profit/loss.
 *
 * @param id                standard entity identifier
 * @param investmentId      database primary key UUID
 * @param symbol            ticker symbol
 * @param name              asset name
 * @param originalQuantity  original lot size
 * @param remainingQuantity current quantity held
 * @param purchaseUnitPrice unit acquisition price
 * @param currentPrice      current market price
 * @param totalInvested     total cost basis (purchaseUnitPrice * quantity)
 * @param currentTotalValue current market valuation (currentPrice * quantity)
 * @param profit            nominal profit or loss amount
 * @param profitPercentage  profit percentage relative to total invested
 * @param purchaseDate      acquisition date
 */
public record HoldingResponse(
        UUID id,
        UUID investmentId,
        String symbol,
        String name,
        BigDecimal originalQuantity,
        BigDecimal remainingQuantity,
        BigDecimal purchaseUnitPrice,
        BigDecimal currentPrice,
        BigDecimal totalInvested,
        BigDecimal currentTotalValue,
        BigDecimal profit,
        Double profitPercentage,
        LocalDate purchaseDate,
        InvestmentType investmentType,
        BigDecimal annualRate,
        String priceStatus,
        Instant quotedAt,
        FixedIncomeTerms fixedIncome,
        LocalDate valuationThrough
) {
    /**
     * Converts an {@link Investment} entity to a {@link HoldingResponse} calculating valuations and profit.
     *
     * @param entity the source entity
     * @return initialized {@link HoldingResponse}
     */
    public static HoldingResponse from(Investment entity) {
        return from(entity, LocalDate.now());
    }

    public static HoldingResponse from(Investment entity, LocalDate valuationDate) {
        return from(entity, valuationDate, null, Instant.now());
    }

    public static HoldingResponse from(Investment entity, LocalDate valuationDate, MarketPrice quote, Instant now) {
        return from(entity, valuationDate, quote, now, null);
    }

    public static HoldingResponse from(Investment entity, LocalDate valuationDate, MarketPrice quote, Instant now, Estimate estimate) {
        BigDecimal qty = entity.getRemainingQuantity() != null ? entity.getRemainingQuantity() : entity.getOriginalQuantity();
        BigDecimal buyPrice = entity.getPurchaseUnitPrice();
        BigDecimal currPrice = quote == null ? entity.getCurrentPrice() : quote.price();
        Instant quotedAt = quote == null ? null : quote.quotedAt();

        BigDecimal totalInvested = buyPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);
        BigDecimal currentTotal;
        String priceStatus;
        LocalDate valuationThrough = null;
        boolean fixed = entity.getInvestmentType() == InvestmentType.FIXED_INCOME;
        if (fixed && entity.getCdiPercentage() != null) {
            currentTotal = estimate == null ? totalInvested : buyPrice.multiply(qty).multiply(estimate.factor()).setScale(2, RoundingMode.HALF_UP);
            currPrice = estimate == null || qty.signum() == 0 ? null : currentTotal.divide(qty, 10, RoundingMode.HALF_UP);
            valuationThrough = estimate == null ? null : estimate.through();
            priceStatus = estimate == null ? "UNAVAILABLE" : estimate.stale() ? "STALE" : "ESTIMATED";
        } else if (fixed) {
            valuationThrough = effectiveValuationDate(entity, valuationDate);
            long days = Math.max(0, ChronoUnit.DAYS.between(entity.getPurchaseDate(), valuationThrough));
            BigDecimal base = BigDecimal.ONE.add(entity.getAnnualRate().movePointLeft(2));
            currentTotal = compoundValue(buyPrice.multiply(qty), base, days);
            currPrice = qty.signum() == 0 ? buyPrice : currentTotal.divide(qty, 10, RoundingMode.HALF_UP);
            priceStatus = "ESTIMATED";
        } else {
            BigDecimal valuationPrice = currPrice == null ? buyPrice : currPrice;
            currentTotal = valuationPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            if (currPrice == null) {
                priceStatus = "UNAVAILABLE";
            } else if (quotedAt == null || quotedAt.isAfter(now) || quotedAt.isBefore(now.minus(Duration.ofHours(24)))) {
                priceStatus = "STALE";
            } else {
                priceStatus = "MARKET";
            }
        }
        BigDecimal profit = currentTotal.subtract(totalInvested);

        Double profitPct = 0.0;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitPct = profit.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return new HoldingResponse(
                entity.getInvestmentId(),
                entity.getInvestmentId(),
                entity.getSymbol(),
                entity.getName(),
                entity.getOriginalQuantity(),
                entity.getRemainingQuantity(),
                entity.getPurchaseUnitPrice(),
                currPrice,
                totalInvested,
                currentTotal,
                profit,
                profitPct,
                entity.getPurchaseDate(),
                entity.getInvestmentType(),
                entity.getAnnualRate(),
                priceStatus,
                quotedAt,
                fixed ? new FixedIncomeTerms(entity.getFixedProduct(), entity.getInstitution(), entity.getCdiPercentage(), entity.getMaturityDate()) : null,
                valuationThrough
        );
    }

    public static LocalDate effectiveValuationDate(Investment entity, LocalDate date) {
        return entity.getMaturityDate() != null && entity.getMaturityDate().isBefore(date) ? entity.getMaturityDate() : date;
    }

    private static BigDecimal compoundValue(BigDecimal principal, BigDecimal base, long days) {
        BigDecimal whole = principal.multiply(base.pow(Math.toIntExact(days / 365)));
        int remainder = (int) (days % 365);
        if (remainder == 0 || whole.signum() == 0) return whole.setScale(2, RoundingMode.HALF_UP);

        int scale = Math.max(40, whole.precision() - whole.scale() + 20);
        BigDecimal normalized = base.stripTrailingZeros();
        BigInteger numerator = normalized.unscaledValue();
        int baseScale = normalized.scale();
        if (baseScale < 0) {
            numerator = numerator.multiply(BigInteger.TEN.pow(-baseScale));
            baseScale = 0;
        }
        // The integer root bounds the fractional factor to one unit at the chosen decimal scale.
        BigInteger radicand = numerator.pow(remainder)
                .multiply(BigInteger.TEN.pow(scale * 365))
                .divide(BigInteger.TEN.pow(baseScale * remainder));
        BigInteger root = BigDecimal.valueOf(Math.pow(base.doubleValue(), remainder / 365.0))
                .add(new BigDecimal("0.00000001")).setScale(8, RoundingMode.CEILING)
                .movePointRight(scale).toBigIntegerExact();
        if (root.pow(365).compareTo(radicand) < 0) root = BigInteger.TEN.pow(scale).multiply(BigInteger.valueOf(11));
        BigInteger degree = BigInteger.valueOf(365);
        while (true) {
            BigInteger next = root.multiply(BigInteger.valueOf(364))
                    .add(radicand.divide(root.pow(364))).divide(degree);
            if (next.compareTo(root) >= 0) break;
            root = next;
        }
        BigDecimal lower = whole.multiply(new BigDecimal(root, scale));
        BigDecimal upper = whole.multiply(new BigDecimal(root.add(BigInteger.ONE), scale));
        BigDecimal roundedLower = lower.setScale(2, RoundingMode.HALF_UP);
        BigDecimal roundedUpper = upper.setScale(2, RoundingMode.HALF_UP);
        if (roundedLower.compareTo(roundedUpper) == 0) return roundedLower;

        // Resolve a possible half-cent boundary by comparing exact 365th powers.
        BigDecimal midpoint = roundedLower.add(new BigDecimal("0.005"));
        return whole.pow(365).multiply(base.pow(remainder)).compareTo(midpoint.pow(365)) >= 0
                ? roundedUpper : roundedLower;
    }
}
