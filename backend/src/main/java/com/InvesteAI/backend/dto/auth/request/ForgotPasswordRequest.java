package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for initiating a password recovery flow.
 *
 * @param identifier user email or CPF identifier
 * @param email      optional explicit email alias
 * @param cpf        optional explicit CPF alias
 */
public record ForgotPasswordRequest(
        @NotBlank(message = "O identificador (e-mail ou CPF) é obrigatório")
        String identifier,
        String email,
        String cpf
) {
    /**
     * Resolves the primary identifier from the available fields.
     *
     * @return trimmed non-blank identifier string, or empty string if none provided
     */
    public String resolvedIdentifier() {
        if (identifier != null && !identifier.isBlank()) return identifier.trim();
        if (email != null && !email.isBlank()) return email.trim();
        if (cpf != null && !cpf.isBlank()) return cpf.trim();
        return "";
    }
}
