package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Form;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FormInterface extends JpaRepository<Form, UUID> {
    Optional<Form> findByProfile_ProfileId(UUID profileId);
}
