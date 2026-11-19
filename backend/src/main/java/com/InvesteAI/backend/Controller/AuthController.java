package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.request.ForgotPasswordRequest;
import com.InvesteAI.backend.dto.auth.request.LoginRequest;
import com.InvesteAI.backend.dto.auth.request.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.request.RegisterRequest;
import com.InvesteAI.backend.dto.auth.request.ResetPasswordRequest;
import com.InvesteAI.backend.dto.auth.response.AuthResponse;
import com.InvesteAI.backend.dto.auth.response.ForgotPasswordResponse;
import com.InvesteAI.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller managing authentication, registration, session lifecycle, and password recovery.
 * <p>
 * Exposes public endpoints for creating unified user profiles, issuing JWT access and refresh tokens,
 * renewing sessions, and performing secure password resets.
 * </p>
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account, personal profile, and onboarding questionnaire responses atomically.
     *
     * @param request the registration payload containing credentials, profile info, and form answers
     * @return {@link ResponseEntity} containing access and refresh JWT tokens upon successful registration
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Authenticates an existing user using their email or CPF along with their password.
     *
     * @param request the login credentials containing identifier (email or CPF) and password
     * @return {@link ResponseEntity} containing newly generated access and refresh JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Initiates a password recovery request for the account associated with the given identifier.
     *
     * @param request the password recovery payload with email or CPF
     * @return {@link ResponseEntity} with confirmation message and verification token/code
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Resets a user's password after verifying the submitted recovery verification code.
     *
     * @param request the payload containing user identifier, verification code, and new password
     * @return {@link ResponseEntity} containing a success confirmation message
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /**
     * Handles bad credentials authentication failures.
     *
     * @return {@link ResponseEntity} with HTTP 401 Unauthorized status
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Void> authenticationFailed() {
        return ResponseEntity.status(401).build();
    }

    /**
     * Handles illegal argument and validation constraint errors.
     *
     * @return {@link ResponseEntity} with HTTP 400 Bad Request status
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Void> invalidAuthenticationRequest() {
        return ResponseEntity.badRequest().build();
    }

    /**
     * Refreshes an expired access token using a valid, unexpired refresh token.
     *
     * @param request the payload containing the active refresh token
     * @return {@link ResponseEntity} containing a new access and refresh token pair
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    /**
     * Logs out the current user session.
     *
     * @return {@link ResponseEntity} confirming successful session invalidation
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        authService.logout();

        return ResponseEntity.ok(Map.of(
                "message", "Logout realizado com sucesso"
        ));
    }
}
