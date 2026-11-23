package com.InvesteAI.backend.validation;

import java.util.Locale;
import java.util.regex.Pattern;

public final class AuthIdentifiers {

    private static final Pattern CPF_DIGITS = Pattern.compile("[0-9]{11}");

    private AuthIdentifiers() {
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeCpf(String cpf) {
        if (cpf == null) {
            throw new IllegalArgumentException("CPF inválido");
        }

        String normalized = cpf.trim().replace(".", "").replace("-", "");
        if (!CPF_DIGITS.matcher(normalized).matches()
                || hasRepeatedDigits(normalized)
                || calculateCheckDigit(normalized.substring(0, 9)) != normalized.charAt(9) - '0'
                || calculateCheckDigit(normalized.substring(0, 10)) != normalized.charAt(10) - '0') {
            throw new IllegalArgumentException("CPF inválido");
        }

        return normalized;
    }

    private static boolean hasRepeatedDigits(String cpf) {
        return cpf.chars().allMatch(digit -> digit == cpf.charAt(0));
    }

    private static int calculateCheckDigit(String digits) {
        int weightedSum = 0;
        int weight = digits.length() + 1;
        for (int index = 0; index < digits.length(); index++) {
            weightedSum += (digits.charAt(index) - '0') * (weight - index);
        }

        int remainder = weightedSum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}