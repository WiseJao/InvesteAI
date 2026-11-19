package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "O identificador é obrigatório")
        String identifier,
        @NotBlank(message = "O código de verificação é obrigatório")
        String code,
        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String newPassword,
        String password // Alias for newPassword
) {
    public String resolvedPassword() {
        if (newPassword != null && !newPassword.isBlank()) return newPassword;
        return password;
    }
}
