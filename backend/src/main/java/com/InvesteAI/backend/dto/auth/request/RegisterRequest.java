package com.InvesteAI.backend.dto.auth.request;

public record RegisterRequest(
        String name,
        String email,
        String password
) {
}
