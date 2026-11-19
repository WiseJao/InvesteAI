package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UnifiedRegisterRequest(
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
    public UnifiedRegisterRequest {
        email = email == null ? null : email.trim();
    }

    public RegisterRequest toRegisterRequest() {
        return new RegisterRequest(
                name,
                email,
                password,
                cpf,
                nickname,
                occupation,
                salary,
                salaryDate,
                hearAboutUs,
                howWantsToUse,
                openFinance,
                currentBanks,
                favoriteColor
        );
    }
}
