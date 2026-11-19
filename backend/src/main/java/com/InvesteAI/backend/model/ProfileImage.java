package com.InvesteAI.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/** A profile's stored image, identified by its profile ID rather than user ID. */
@Entity
@Table(name = "profile_images")
@Getter
@Setter
@NoArgsConstructor
public class ProfileImage {
    /** Identifier of the owning profile. */
    @Id
    @Column(name = "profile_id")
    private UUID profileId;

    /** Original image bytes. */
    @Column(name = "image_data", nullable = false)
    private byte[] imageData;

    /** Validated image media type. */
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    /** Time the image record was created. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Time the image record was last updated. */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}