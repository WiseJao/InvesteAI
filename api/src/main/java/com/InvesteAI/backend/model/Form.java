package com.InvesteAI.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Entity representing onboarding questionnaire responses collected during user registration.
 * <p>
 * Stores referral channels, usage intentions, Open Finance consent, and existing banking relationships.
 * </p>
 */
@Entity
@Table(name = "form")
@Getter
@Setter
@NoArgsConstructor
public class Form {

    /**
     * Unique identifier for the onboarding form response record.
     */
    @Id
    @Column(name = "form_id", nullable = false, updatable = false)
    private UUID formId;

    /**
     * The associated user profile linked to this onboarding form.
     */
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_forms_profile"))
    private Profile profile;

    /**
     * Referral channel where the user heard about the platform.
     */
    @Column(name = "hear_about_us", columnDefinition = "text")
    private String hearAboutUs;

    /**
     * User's stated goals and objectives for using the platform.
     */
    @Column(name = "how_wants_to_use", columnDefinition = "text")
    private String howWantsToUse;

    /**
     * Indicates whether the user consented to Open Finance data integration.
     */
    @Column(name = "open_finance", nullable = false)
    private Boolean openFinance = false;

    /**
     * Comma-separated list or notes of the user's current banking institutions.
     */
    @Column(name = "current_banks", columnDefinition = "text")
    private String currentBanks;

    /**
     * Pre-persists default UUID and fallback boolean flags before insert.
     */
    @PrePersist
    public void prePersist() {
        if (formId == null) {
            formId = UuidCreator.getTimeOrderedEpoch();
        }
        if (openFinance == null) {
            openFinance = false;
        }
    }
}
