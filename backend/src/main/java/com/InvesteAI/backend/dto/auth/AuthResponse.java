package com.InvesteAI.backend.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {
}
