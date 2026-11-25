package com.InvesteAI.backend.dto.investment.request;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FixedIncomeTerms(String product, String institution, BigDecimal cdiPercentage, LocalDate maturityDate) {}
