package com.InvesteAI.backend.dto.auth.response;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {
}
