package com.InvesteAI.backend.dto.auth;

public record RegisterRequest(
        String name,
        String email,
        String password
) {
}
