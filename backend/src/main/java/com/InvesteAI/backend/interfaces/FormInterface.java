package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Form;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository interface for onboarding {@link Form} entities.
 * <p>
 * Provides query methods for retrieving form answers linked to specific user profiles.
 * </p>
 */
public interface FormInterface extends JpaRepository<Form, UUID> {

    /**
     * Finds the onboarding form associated with a given profile identifier.
     *
     * @param profileId the unique UUID of the profile
     * @return an {@link Optional} containing the {@link Form} if found, or empty otherwise
     */
    Optional<Form> findByProfile_ProfileId(UUID profileId);
}
