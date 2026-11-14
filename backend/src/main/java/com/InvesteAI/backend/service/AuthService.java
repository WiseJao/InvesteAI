package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.auth.response.AuthResponse;
import com.InvesteAI.backend.dto.auth.request.LoginRequest;
import com.InvesteAI.backend.dto.auth.request.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.request.RegisterRequest;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.security.JwtService;
import com.InvesteAI.backend.validation.AuthIdentifiers;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserInterface userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = AuthIdentifiers.normalizeEmail(request.email());
        String cpf = AuthIdentifiers.normalizeCpf(request.cpf());
        if (email.isBlank()) {
            throw new IllegalArgumentException("E-mail inválido");
        }
        if (userRepository.existsByEmail(email) || userRepository.existsByCpf(cpf)) {
            throw duplicateIdentifier();
        }

        User user = new User();
        user.setEmail(email);
        user.setCpf(cpf);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        Profile profile = new Profile();
        profile.setName(request.name().trim());
        user.setProfile(profile);

        User savedUser;
        try {
            savedUser = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw duplicateIdentifier();
        }

        String accessToken = jwtService.generateAccessToken(savedUser.getId());
        String refreshToken = jwtService.generateRefreshToken(savedUser.getId());

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.identifier(), request.password()));
        } catch (AuthenticationException exception) {
            throw invalidCredentials();
        }

        if (!(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw invalidCredentials();
        }

        UUID userId;
        try {
            userId = UUID.fromString(principal.getUsername());
        } catch (IllegalArgumentException exception) {
            throw invalidCredentials();
        }

        String accessToken = jwtService.generateAccessToken(userId);
        String refreshToken = jwtService.generateRefreshToken(userId);

        return new AuthResponse(accessToken, refreshToken);
    }

    private static IllegalArgumentException duplicateIdentifier() {
        return new IllegalArgumentException("E-mail ou CPF já cadastrado");
    }

    private static BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid credentials");
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtService.isValidRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Refresh token inválido");
        }

        UUID userId = jwtService.extractUserId(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(userId);
        String newRefreshToken = jwtService.generateRefreshToken(userId);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    public void logout() {
        // Em JWT stateless simples, o logout é feito no cliente apagando os tokens.
        // Se quiser invalidar tokens no backend, implemente blacklist/revocation list.
    }
}
