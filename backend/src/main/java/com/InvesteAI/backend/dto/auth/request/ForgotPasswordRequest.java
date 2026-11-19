package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "O identificador (e-mail ou CPF) é obrigatório")
        String identifier,
        String email,
        String cpf
) {
    public String resolvedIdentifier() {
        if (identifier != null && !identifier.isBlank()) return identifier.trim();
        if (email != null && !email.isBlank()) return email.trim();
        if (cpf != null && !cpf.isBlank()) return cpf.trim();
        return "";
    }
}
