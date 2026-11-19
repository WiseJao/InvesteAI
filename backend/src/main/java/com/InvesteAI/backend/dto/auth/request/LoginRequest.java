package com.InvesteAI.backend.dto.auth.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @JsonAlias("email") @NotBlank
        String identifier,
        @NotBlank
        String password
) {
}
