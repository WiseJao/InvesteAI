package com.InvesteAI.backend.dto.auth;

public record LoginRequest(
        String email,
        String password
) {
}
