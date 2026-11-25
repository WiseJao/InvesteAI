package com.InvesteAI.backend.dto.auth.response;

import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;

import java.util.UUID;

public record UserResponse(
        UUID id,
        Profile profile,
        String email,
        String cpf
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getProfile(),
                user.getEmail(),
                user.getCpf()
        );
    }
}
