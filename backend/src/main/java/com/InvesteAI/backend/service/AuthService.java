package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.auth.AuthResponse;
import com.InvesteAI.backend.dto.auth.LoginRequest;
import com.InvesteAI.backend.dto.auth.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.RegisterRequest;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserInterface userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken);
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
