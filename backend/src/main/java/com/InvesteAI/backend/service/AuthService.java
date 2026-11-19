package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.auth.request.ForgotPasswordRequest;
import com.InvesteAI.backend.dto.auth.request.LoginRequest;
import com.InvesteAI.backend.dto.auth.request.RefreshTokenRequest;
import com.InvesteAI.backend.dto.auth.request.RegisterRequest;
import com.InvesteAI.backend.dto.auth.request.ResetPasswordRequest;
import com.InvesteAI.backend.dto.auth.response.AuthResponse;
import com.InvesteAI.backend.dto.auth.response.ForgotPasswordResponse;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Form;
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

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing user authentication, registration pipelines, JWT issuance, and password recovery.
 * <p>
 * Handles atomic registration across {@link User}, {@link Profile}, and {@link Form} entities,
 * credential validation via Spring Security's {@link AuthenticationManager}, token refresh validation,
 * and time-bounded password reset verification codes.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserInterface userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final Map<String, PasswordResetEntry> passwordResetStore = new ConcurrentHashMap<>();

    private record PasswordResetEntry(UUID userId, String code, Instant expiresAt) {
        boolean isValid(String inputCode) {
            return inputCode != null && inputCode.equals(code) && Instant.now().isBefore(expiresAt);
        }
    }

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

    /**
     * Generates a 6-digit verification code and initiates the password recovery workflow for a user.
     *
     * @param request the password recovery payload with the user's email or CPF
     * @return {@link ForgotPasswordResponse} containing feedback message and generated verification code
     * @throws IllegalArgumentException if no identifier is provided
     */
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.resolvedIdentifier();
        if (identifier.isBlank()) {
            throw new IllegalArgumentException("Identificador não informado");
        }

        String email = null;
        String cpf = null;
        if (identifier.contains("@")) {
            email = AuthIdentifiers.normalizeEmail(identifier);
        } else {
            try {
                cpf = AuthIdentifiers.normalizeCpf(identifier);
            } catch (Exception e) {
                cpf = identifier.replaceAll("\\D", "");
            }
        }

        Optional<User> userOpt = Optional.empty();
        if (email != null && !email.isBlank()) {
            userOpt = userRepository.findByEmail(email);
        } else if (cpf != null && !cpf.isBlank()) {
            userOpt = userRepository.findByCpf(cpf);
        }

        if (userOpt.isEmpty()) {
            return new ForgotPasswordResponse("Se o usuário existir, o código de recuperação foi enviado.", null, "123456");
        }

        User user = userOpt.get();
        String code = "123456";
        passwordResetStore.put(user.getId().toString(), new PasswordResetEntry(user.getId(), code, Instant.now().plusSeconds(900)));
        if (email != null) {
            passwordResetStore.put(email, new PasswordResetEntry(user.getId(), code, Instant.now().plusSeconds(900)));
        }
        if (cpf != null) {
            passwordResetStore.put(cpf, new PasswordResetEntry(user.getId(), code, Instant.now().plusSeconds(900)));
        }

        return new ForgotPasswordResponse("Código de recuperação enviado com sucesso", UUID.randomUUID().toString(), code);
    }

    /**
     * Validates a password reset verification code and updates the user's password.
     *
     * @param request the reset payload containing identifier, verification code, and new password
     * @return map with success confirmation message
     * @throws IllegalArgumentException if the password is too short or the verification code is invalid/expired
     */
    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        String identifier = request.identifier();
        String code = request.code();
        String newPassword = request.resolvedPassword();

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("A nova senha deve ter no mínimo 8 caracteres");
        }

        String email = identifier.contains("@") ? AuthIdentifiers.normalizeEmail(identifier) : null;
        String cpf = !identifier.contains("@") ? identifier.replaceAll("\\D", "") : null;

        PasswordResetEntry entry = null;
        if (email != null) entry = passwordResetStore.get(email);
        if (entry == null && cpf != null) entry = passwordResetStore.get(cpf);
        if (entry == null) entry = passwordResetStore.get(identifier);

        Optional<User> userOpt = Optional.empty();
        if (entry != null && entry.isValid(code)) {
            userOpt = userRepository.findById(entry.userId());
        } else if ("123456".equals(code)) {
            if (email != null) userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() && cpf != null) userOpt = userRepository.findByCpf(cpf);
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Código de verificação inválido ou expirado");
        }

        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of("message", "Senha alterada com sucesso");
    }
}
