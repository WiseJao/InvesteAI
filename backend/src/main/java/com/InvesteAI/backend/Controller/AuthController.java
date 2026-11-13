package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.AuthResponse;
import com.InvesteAI.backend.dto.auth.LoginRequest;
import com.InvesteAI.backend.dto.auth.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.RegisterRequest;
import com.InvesteAI.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
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
