package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.auth.request.ChangePasswordRequest;
import com.InvesteAI.backend.dto.auth.request.LoginRequest;
import com.InvesteAI.backend.dto.auth.request.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.request.RegisterRequest;
import com.InvesteAI.backend.dto.auth.response.AuthResponse;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Form;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.security.JwtService;
import com.InvesteAI.backend.validation.AuthIdentifiers;
import com.InvesteAI.backend.validation.PersistedFields;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;

import java.util.UUID;

/**
 * Service managing user authentication, registration pipelines, JWT issuance, and password recovery.
 * <p>
 * Handles atomic registration across {@link User}, {@link Profile}, and {@link Form} entities,
 * credential validation via Spring Security's {@link AuthenticationManager}, token refresh validation,
 * and authenticated password changes.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserInterface userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    /**
     * Atomically registers a new user, profile, and onboarding questionnaire responses.
     *
     * @param request the registration request containing credentials, personal information, and onboarding questions
     * @return {@link AuthResponse} containing access and refresh tokens
     * @throws IllegalArgumentException if the email is blank or an account with the given email/CPF already exists
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = AuthIdentifiers.normalizeEmail(request.email());
        String cpf = AuthIdentifiers.normalizeCpf(request.cpf());
        PersistedFields.text(request.name(), 255, "nome");
        PersistedFields.optionalText(request.nickname(), 255, "apelido");
        if (request.salary() != null) PersistedFields.money(request.salary(), false, "salário");
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
        if (request.nickname() != null && !request.nickname().isBlank()) {
            profile.setNickname(request.nickname().trim());
        }
        if (request.occupation() != null && !request.occupation().isBlank()) {
            profile.setOccupation(request.occupation().trim());
        }
        if (request.salary() != null) {
            profile.setSalary(request.salary());
        }
        if (request.salaryDate() != null) {
            profile.setSalaryDate(request.salaryDate());
        }
        user.setProfile(profile);

        if (request.hearAboutUs() != null || request.howWantsToUse() != null
                || request.openFinance() != null || request.currentBanks() != null) {
            Form form = new Form();
            form.setHearAboutUs(request.hearAboutUs());
            form.setHowWantsToUse(request.howWantsToUse());
            form.setOpenFinance(request.openFinance() != null ? request.openFinance() : false);
            form.setCurrentBanks(request.currentBanks());
            profile.setForm(form);
        }

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

    /**
     * Authenticates a user using their email or CPF identifier and password.
     *
     * @param request the login request payload containing user identifier and password
     * @return {@link AuthResponse} containing access and refresh tokens
     * @throws BadCredentialsException if authentication fails due to incorrect credentials
     */
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

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }
        int bytes = request.newPassword().getBytes(StandardCharsets.UTF_8).length;
        if (request.newPassword().length() < 8 || bytes > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha deve ter ao menos 8 caracteres e no máximo 72 bytes");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    /**
     * Issues a new access token and refresh token pair using an unexpired refresh token.
     *
     * @param request the refresh request containing the current refresh token
     * @return {@link AuthResponse} containing new access and refresh tokens
     * @throws IllegalArgumentException if the provided refresh token is expired, corrupted, or invalid
     */
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

    /**
     * Invalidates the current user session (stateless JWT client cleanup hook).
     */
    public void logout() {
        // Em JWT stateless simples, o logout é feito no cliente apagando os tokens.
        // Se quiser invalidar tokens no backend, implemente blacklist/revocation list.
    }

}
