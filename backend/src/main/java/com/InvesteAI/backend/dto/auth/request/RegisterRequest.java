package com.InvesteAI.backend.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 255)
        String name,
        @NotBlank @Email @Size(max = 255)
        String email,
        @NotBlank
        String password,
        @NotBlank
        String cpf
) {
    public RegisterRequest {
        email = email == null ? null : email.trim();
    }
}
