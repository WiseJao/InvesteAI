package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.request.ChangePasswordRequest;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/users/me")
public class AccountSecurityController {
    private final AuthService authService;

    public AccountSecurityController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@CurrentUser UUID userId, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }
}