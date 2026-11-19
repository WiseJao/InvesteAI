package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.ProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/** Persistence for profile images, keyed by profile ID. */
public interface ProfileImageInterface extends JpaRepository<ProfileImage, UUID> {
}