package com.InvesteAI.backend.validation;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class PersistedFields {
    private PersistedFields() {
    }

    public static void money(BigDecimal value, boolean positive, String field) {
        if (value == null || value.signum() < (positive ? 1 : 0)
                || value.stripTrailingZeros().scale() > 2
                || value.abs().compareTo(new BigDecimal("100000000000000000")) >= 0) {
            throw invalid(field);
        }
    }

    public static void text(String value, int max, String field) {
        if (value == null || value.isBlank() || value.codePointCount(0, value.length()) > max) {
            throw invalid(field);
        }
    }

    public static void optionalText(String value, int max, String field) {
        if (value != null && value.codePointCount(0, value.length()) > max) throw invalid(field);
    }

    public static void dates(LocalDate start, LocalDate end) {
        if (start == null || (end != null && end.isBefore(start))) throw invalid("datas");
    }

    public static ResponseStatusException invalid(String field) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor inválido: " + field);
    }
}