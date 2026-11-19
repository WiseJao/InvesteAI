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

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Void> authenticationFailed() {
        return ResponseEntity.status(401).build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Void> invalidAuthenticationRequest() {
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        authService.logout();

        return ResponseEntity.ok(Map.of(
                "message", "Logout realizado com sucesso"
        ));
    }
}
