package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Registration request payload supporting core credentials, profile attributes, and onboarding answers.
 *
 * @param name          full name of the user
 * @param email         account email address
 * @param password      plaintext account password
 * @param cpf           Brazilian CPF number
 * @param nickname      optional display nickname
 * @param occupation    declared profession or job
 * @param salary        declared monthly salary
 * @param salaryDate    declared monthly salary payday
 * @param hearAboutUs   referral source
 * @param howWantsToUse planned platform usage
 * @param openFinance   consent to Open Finance
 * @param currentBanks  current banking relationships
 * @param favoriteColor favorite theme color
 */
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
    /**
     * Backward-compatible constructor for basic registration without profile or questionnaire fields.
     *
     * @param name     full name
     * @param email    email address
     * @param password password
     * @param cpf      CPF number
     */
    public RegisterRequest(String name, String email, String password, String cpf) {
        this(name, email, password, cpf, null, null, null, null, null, null, null, null, null);
    }

    public RegisterRequest {
        email = email == null ? null : email.trim();
    }
}
