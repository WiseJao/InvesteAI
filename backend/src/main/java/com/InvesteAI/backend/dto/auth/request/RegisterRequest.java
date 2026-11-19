package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(max = 255)
        String name,
        @NotBlank @Email @Size(max = 255)
        String email,
        @NotBlank
        String password,
        @NotBlank
        String cpf,
        String nickname,
        String occupation,
        BigDecimal salary,
        LocalDate salaryDate,
        String hearAboutUs,
        String howWantsToUse,
        Boolean openFinance,
        String currentBanks,
        String favoriteColor
) {
    public RegisterRequest(String name, String email, String password, String cpf) {
        this(name, email, password, cpf, null, null, null, null, null, null, null, null, null);
    }

    public RegisterRequest {
        email = email == null ? null : email.trim();
    }
}
