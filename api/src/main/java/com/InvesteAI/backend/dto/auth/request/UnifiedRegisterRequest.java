package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Unified registration request payload combining credentials, user profile details, and onboarding answers.
 *
 * @param name          full legal name of the user
 * @param email         account email address used for login and notifications
 * @param password      plaintext account password
 * @param cpf           Brazilian CPF tax ID
 * @param nickname      optional display name or nickname
 * @param occupation    user's profession or job title
 * @param salary        declared monthly base salary
 * @param salaryDate    declared monthly salary receipt date
 * @param hearAboutUs   referral source channel
 * @param howWantsToUse primary motivation for using the app
 * @param openFinance   consent to Open Finance data integration
 * @param currentBanks  user's active banking institutions
 * @param favoriteColor user's selected UI theme or favorite color
 */
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

    /**
     * Converts this unified payload to an internal {@link RegisterRequest} instance.
     *
     * @return equivalent {@link RegisterRequest}
     */
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
