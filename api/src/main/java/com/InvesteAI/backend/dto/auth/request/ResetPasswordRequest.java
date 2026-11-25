package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for confirming password reset with a verification code.
 *
 * @param identifier  email or CPF identifying the account
 * @param code        the 6-digit verification code received by the user
 * @param newPassword the new password to set (minimum 8 characters)
 * @param password    alias field for newPassword
 */
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
    /**
     * Resolves the desired new password from the primary and alias fields.
     *
     * @return the new password string
     */
    public String resolvedPassword() {
        if (newPassword != null && !newPassword.isBlank()) return newPassword;
        return password;
    }
}
