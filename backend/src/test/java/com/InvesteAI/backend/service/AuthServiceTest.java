package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.auth.request.LoginRequest;
import com.InvesteAI.backend.dto.auth.request.RegisterRequest;
import com.InvesteAI.backend.dto.auth.response.AuthResponse;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Documents authentication service contracts, including atomic registration input,
 * duplicate-identifier races, principal-based token creation, and generic login errors.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserInterface userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    /**
     * Intent: clients using the existing email-based login contract must continue
     * working after the request field is generalized to an identifier.
     * Setup: deserialize a request containing the legacy `email` JSON property.
     * Expected: its value is exposed as the new identifier and the password is kept.
     */
    @Test
    void acceptsLegacyEmailLoginField() throws Exception {
        LoginRequest request = new ObjectMapper().readValue(
                "{\"email\":\"person@example.com\",\"password\":\"safe-password\"}",
                LoginRequest.class);

        assertEquals("person@example.com", request.identifier());
        assertEquals("safe-password", request.password());
    }

    /**
     * Intent: registration must canonicalize identifiers, hash the password, and
     * pass one correctly linked user/profile aggregate to persistence.
     * Setup: model a successful flush and collect the persisted aggregate.
     * Expected: IDs are independent, fields are placed on the right entity, and JWTs
     * use the newly persisted user UUID.
     */
    @Test
    void registersCanonicalUserAndProfileTogether() {
        when(userRepository.existsByEmail("person@example.com")).thenReturn(false);
        when(userRepository.existsByCpf("52998224725")).thenReturn(false);
        when(passwordEncoder.encode("safe-password")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.prePersist();
            user.getProfile().prePersist();
            return user;
        });
        when(jwtService.generateAccessToken(any(UUID.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(UUID.class))).thenReturn("refresh-token");

        AuthResponse response = authService.register(new RegisterRequest(
                "  Person  ", " Person@Example.com ", "safe-password", "529.982.247-25"));

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(savedUser.capture());
        User user = savedUser.getValue();
        assertEquals("person@example.com", user.getEmail());
        assertEquals("52998224725", user.getCpf());
        assertEquals("encoded-password", user.getPasswordHash());
        assertEquals("Person", user.getProfile().getName());
        assertSame(user, user.getProfile().getUser());
        assertNotEquals(user.getId(), user.getProfile().getProfileId());
        assertEquals(new AuthResponse("access-token", "refresh-token"), response);
        verify(jwtService).generateAccessToken(user.getId());
    }

    @Test
    void registersUnifiedUserWithProfileAndForm() {
        when(userRepository.existsByEmail("jane.doe@example.com")).thenReturn(false);
        when(userRepository.existsByCpf("52998224725")).thenReturn(false);
        when(passwordEncoder.encode("SecurePassword123!")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.prePersist();
            user.getProfile().prePersist();
            if (user.getProfile().getForm() != null) {
                user.getProfile().getForm().prePersist();
            }
            return user;
        });
        when(jwtService.generateAccessToken(any(UUID.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(UUID.class))).thenReturn("refresh-token");

        RegisterRequest request = new RegisterRequest(
                "Jane Doe",
                "jane.doe@example.com",
                "SecurePassword123!",
                "529.982.247-25",
                "Jane",
                "Desenvolvedora",
                new java.math.BigDecimal("8500.00"),
                java.time.LocalDate.of(2025, 1, 5),
                "Instagram",
                "Investimentos",
                true,
                "Nubank, Itaú",
                "#5856D6"
        );

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(savedUser.capture());
        User user = savedUser.getValue();
        assertEquals("jane.doe@example.com", user.getEmail());
        assertEquals("52998224725", user.getCpf());
        assertEquals("Jane Doe", user.getProfile().getName());
        assertEquals("Jane", user.getProfile().getNickname());
        assertEquals("Desenvolvedora", user.getProfile().getOccupation());
        assertEquals(new java.math.BigDecimal("8500.00"), user.getProfile().getSalary());
        assertEquals(java.time.LocalDate.of(2025, 1, 5), user.getProfile().getSalaryDate());
        assertEquals("Instagram", user.getProfile().getForm().getHearAboutUs());
        assertEquals("Investimentos", user.getProfile().getForm().getHowWantsToUse());
        assertEquals(true, user.getProfile().getForm().getOpenFinance());
        assertEquals("Nubank, Itaú", user.getProfile().getForm().getCurrentBanks());
        assertEquals(new AuthResponse("access-token", "refresh-token"), response);
    }

    /**
     * Intent: a unique-index race after the pre-check must produce the same generic
     * duplicate-identifier response as an ordinary duplicate.
     * Setup: let both availability checks pass, then simulate a database uniqueness
     * violation during flush.
     * Expected: registration fails without disclosing whether email or CPF collided.
     */
    @Test
    void handlesDuplicateIdentifierRace() {
        when(userRepository.existsByEmail("person@example.com")).thenReturn(false);
        when(userRepository.existsByCpf("52998224725")).thenReturn(false);
        when(passwordEncoder.encode("safe-password")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("unique constraint"));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.register(new RegisterRequest(
                        "Person", "Person@Example.com", "safe-password", "52998224725")));

        assertEquals("E-mail ou CPF já cadastrado", exception.getMessage());
    }

    /**
     * Intent: token subject must come from the successfully authenticated principal,
     * not from an email-only second database lookup.
     * Setup: authenticate using a CPF identifier and return a UUID-named principal.
     * Expected: both tokens are generated for that principal UUID and the repository
     * is not queried again.
     */
    @Test
    void loginUsesAuthenticatedPrincipalForTokenSubject() {
        UUID userId = UUID.randomUUID();
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername(userId.toString())
                .password("encoded-password")
                .authorities(AuthorityUtils.createAuthorityList("ROLE_USER"))
                .build();
        Authentication authenticated = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authenticated);
        when(jwtService.generateAccessToken(userId)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userId)).thenReturn("refresh-token");

        AuthResponse response = authService.login(new LoginRequest("529.982.247-25", "safe-password"));

        assertEquals(new AuthResponse("access-token", "refresh-token"), response);
        verify(jwtService).generateAccessToken(userId);
        verify(userRepository, never()).findByEmail(anyString());
    }

    /**
     * Intent: unknown users, invalid passwords, and disabled accounts must share the
     * same outward-facing authentication error.
     * Setup: model the provider rejecting a disabled account.
     * Expected: the service reports only the generic invalid-credentials message.
     */
    @Test
    void returnsGenericErrorForDisabledAccount() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new DisabledException("account disabled"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("person@example.com", "wrong-password")));

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void handlesForgotPasswordAndResetPasswordFlow() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail("user@example.com");
        user.setPasswordHash("old-hash");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewSecurePassword123!")).thenReturn("new-hash");

        var forgotResponse = authService.forgotPassword(
                new com.InvesteAI.backend.dto.auth.request.ForgotPasswordRequest("user@example.com", null, null));
        assertEquals("Código de recuperação enviado com sucesso", forgotResponse.message());
        assertEquals("123456", forgotResponse.code());

        var resetResponse = authService.resetPassword(
                new com.InvesteAI.backend.dto.auth.request.ResetPasswordRequest("user@example.com", "123456", "NewSecurePassword123!", null));
        assertEquals("Senha alterada com sucesso", resetResponse.get("message"));
        assertEquals("new-hash", user.getPasswordHash());
    }
}