package com.InvesteAI.backend.dto.auth.response;

/**
 * Response payload returned after requesting password recovery.
 *
 * @param message    user-facing status or instruction message
 * @param resetToken token identifying the reset session
 * @param code       generated verification code for local testing or SMS/email simulation
 */
public record ForgotPasswordResponse(
        String message,
        String resetToken,
        String code
) {}
