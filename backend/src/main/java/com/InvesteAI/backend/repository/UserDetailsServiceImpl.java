package com.InvesteAI.backend.repository;

import com.InvesteAI.backend.interfaces.UserInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads {@link UserDetails} by email for Spring Security's authentication manager.
 * The principal stored in the security context is the user UUID (as String),
 * not the email, so downstream code can use it directly.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserInterface ur;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.InvesteAI.backend.model.User user = ur.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getId().toString())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }
}
