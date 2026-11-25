package com.InvesteAI.backend.service;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CdiService {
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/uuuu");
    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private final JdbcClient jdbc;
    private final TransactionTemplate writes;
    private final RestClient client;

    public record Estimate(BigDecimal factor, LocalDate through, boolean stale) {}
    private record Rate(String data, BigDecimal valor) {}

    public CdiService(JdbcClient jdbc, PlatformTransactionManager transactionManager) {
        this.jdbc = jdbc;
        writes = new TransactionTemplate(transactionManager);
        writes.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(2));
        client = RestClient.builder().requestFactory(factory).baseUrl("https://api.bcb.gov.br").build();
    }

    public Estimate estimate(LocalDate start, LocalDate end, BigDecimal percentage) {
        if (!end.isAfter(start)) return new Estimate(BigDecimal.ONE, end, false);
        BigDecimal factor = BigDecimal.ONE;
        LocalDate lastPublished = start;
        boolean stale = false;
        for (int year = start.plusDays(1).getYear(); year <= end.getYear(); year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate through = year == end.getYear() ? end : LocalDate.of(year, 12, 31);
            LocalDate covered = coverage(year);
            if (covered == null || covered.isBefore(through)) {
                covered = refresh(yearStart, through);
            }
            if (covered == null) return lastPublished.equals(start) ? null : new Estimate(factor, lastPublished, true);
            LocalDate from = start.isAfter(yearStart.minusDays(1)) ? start : yearStart.minusDays(1);
            List<Rate> rates = jdbc.sql("""
                    SELECT rate_date AS data, rate AS valor FROM cdi_daily_rate
                    WHERE rate_date > :from AND rate_date <= :until ORDER BY rate_date
                    """).param("from", from).param("until", covered.isBefore(through) ? covered : through)
                    .query((rs, index) -> new Rate(rs.getObject("data", LocalDate.class).toString(), rs.getBigDecimal("valor"))).list();
            for (Rate rate : rates) {
                factor = compound(factor, rate.valor(), percentage);
                lastPublished = LocalDate.parse(rate.data());
            }
            if (covered.isBefore(through)) {
                if (covered.isBefore(from)) return lastPublished.equals(start) ? null : new Estimate(factor, lastPublished, true);
                stale = true;
                break;
            }
        }
        return new Estimate(factor, lastPublished, stale);
    }

    static BigDecimal compound(BigDecimal factor, BigDecimal dailyRate, BigDecimal percentage) {
        return factor.multiply(BigDecimal.ONE.add(dailyRate.multiply(percentage).movePointLeft(4)), MathContext.DECIMAL128);
    }

    private LocalDate coverage(int year) {
        return jdbc.sql("SELECT covered_through FROM cdi_coverage WHERE year = :year")
                .param("year", year).query(LocalDate.class).optional().orElse(null);
    }

    private synchronized LocalDate refresh(LocalDate start, LocalDate through) {
        int year = start.getYear();
        LocalDate cached = coverage(year);
        if (cached != null && !cached.isBefore(through)) return cached;
        try {
            Rate[] rates = client.get().uri(uri -> uri.path("/dados/serie/bcdata.sgs.12/dados")
                    .queryParam("formato", "json").queryParam("dataInicial", DATE.format(start))
                    .queryParam("dataFinal", DATE.format(through)).build()).retrieve().body(Rate[].class);
            if (rates == null || rates.length == 0) return cached;
            LocalDate today = LocalDate.now(ZONE);
            LocalDate verified = through.isBefore(today) ? through : today;
            writes.executeWithoutResult(status -> {
                for (Rate rate : rates) {
                    LocalDate date = LocalDate.parse(rate.data(), DATE);
                    if (date.isBefore(start) || date.isAfter(through) || rate.valor() == null) {
                        throw new IllegalStateException("Resposta inválida da série CDI.");
                    }
                    jdbc.sql("""
                            INSERT INTO cdi_daily_rate (rate_date, rate) VALUES (:date, :rate)
                            ON CONFLICT (rate_date) DO UPDATE SET rate = EXCLUDED.rate
                            """).param("date", date).param("rate", rate.valor()).update();
                }
                jdbc.sql("""
                        INSERT INTO cdi_coverage (year, covered_through) VALUES (:year, :through)
                        ON CONFLICT (year) DO UPDATE SET covered_through =
                            GREATEST(cdi_coverage.covered_through, EXCLUDED.covered_through)
                        """).param("year", year).param("through", verified).update();
            });
            return verified;
        } catch (RuntimeException failure) {
            return cached;
        }
    }
}
