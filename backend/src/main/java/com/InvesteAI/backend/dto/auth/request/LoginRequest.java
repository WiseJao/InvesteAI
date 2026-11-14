package com.InvesteAI.backend.dto.auth.request;

public record LoginRequest(
        String email,
        String password
) {
}
