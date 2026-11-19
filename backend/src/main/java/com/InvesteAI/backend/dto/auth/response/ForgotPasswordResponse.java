package com.InvesteAI.backend.dto.auth.response;

public record ForgotPasswordResponse(
        String message,
        String resetToken,
        String code
) {}
