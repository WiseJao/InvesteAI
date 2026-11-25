package com.InvesteAI.backend.repository;

import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Documents authentication lookup behavior: normalized email and CPF identifiers
 * resolve to a UUID principal, while disabled accounts and invalid identifiers fail.
 */
@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserInterface userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Intent: existing email login remains compatible and email matching is
     * case-insensitive after canonicalization.
     * Setup: register a mock user and request lookup with mixed-case email.
     * Expected: the returned principal uses the user's UUID and is enabled.
     */
    @Test
    void loadsByNormalizedEmail() {
        User user = user("ACTIVE");
        when(userRepository.findByEmail("person@example.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername(" PERSON@Example.COM ");

        assertEquals(user.getId().toString(), details.getUsername());
        assertTrue(details.isEnabled());
        verify(userRepository).findByEmail("person@example.com");
    }

    /**
     * Intent: login must also resolve a CPF, accepting standard punctuation.
     * Setup: register a user under the canonical CPF and request a formatted CPF.
     * Expected: lookup uses eleven digits and returns the owning user's UUID.
     */
    @Test
    void loadsByNormalizedCpf() {
        User user = user("ACTIVE");
        when(userRepository.findByCpf("52998224725")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("529.982.247-25");

        assertEquals(user.getId().toString(), details.getUsername());
        verify(userRepository).findByCpf("52998224725");
    }

    /**
     * Intent: disabled users must be rejected by Spring Security's authentication
     * provider rather than treated like active accounts.
     * Setup: resolve a CPF belonging to a disabled user.
     * Expected: the resulting UserDetails is disabled.
     */
    @Test
    void marksDisabledUserAsDisabled() {
        User user = user("DISABLED");
        when(userRepository.findByCpf("52998224725")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("52998224725");

        assertFalse(details.isEnabled());
    }

    /**
     * Intent: malformed CPF lookups must not reach persistence or disclose the
     * submitted identifier in the authentication error.
     * Setup: attempt to load a repeated-digit CPF.
     * Expected: a generic not-found error is returned without a repository call.
     */
    @Test
    void rejectsInvalidCpfWithoutEchoingIt() {
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("11111111111"));

        assertEquals("Invalid credentials", exception.getMessage());
        verifyNoInteractions(userRepository);
    }

    private static User user(String status) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("person@example.com");
        user.setCpf("52998224725");
        user.setPasswordHash("encoded-test-hash");
        user.setStatus(status);
        return user;
    }
}