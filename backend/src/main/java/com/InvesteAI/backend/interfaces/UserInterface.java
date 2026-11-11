package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserInterface extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByName(String name);

    /** Used for name-change uniqueness check that excludes the current user. */
    boolean existsByNameAndIdNot(String name, UUID id);

}
