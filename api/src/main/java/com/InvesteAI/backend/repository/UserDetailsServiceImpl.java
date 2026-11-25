package com.InvesteAI.backend.repository;

import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.validation.AuthIdentifiers;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads {@link UserDetails} by email or normalized CPF for Spring Security.
 * The principal stored in the security context is the user UUID (as String),
 * not the email, so downstream code can use it directly.
 */
@Service
@RequiredArgsConstructor
@NullMarked
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserInterface ur;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = findUser(identifier);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getId().toString())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .disabled(!"ACTIVE".equals(user.getStatus()))
                .build();
    }

    private User findUser(String identifier) {
        String normalized = AuthIdentifiers.normalizeEmail(identifier);
        if (normalized.contains("@")) {
            return ur.findByEmail(normalized).orElseThrow(UserDetailsServiceImpl::invalidCredentials);
        }

        try {
            String cpf = AuthIdentifiers.normalizeCpf(identifier);
            return ur.findByCpf(cpf).orElseThrow(UserDetailsServiceImpl::invalidCredentials);
        } catch (IllegalArgumentException exception) {
            throw invalidCredentials();
        }
    }

    private static UsernameNotFoundException invalidCredentials() {
        return new UsernameNotFoundException("Invalid credentials");
    }
}
