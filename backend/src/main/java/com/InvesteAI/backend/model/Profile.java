package com.InvesteAI.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity representing a user's personal profile, occupation, and financial baseline.
 * <p>
 * Contains personal details (name, nickname), professional occupation, baseline salary,
 * salary payment date, and a one-to-one relationship with onboarding {@link Form} responses.
 * </p>
 */
@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    /**
     * Unique identifier for the user profile.
     */
    @Id
    @Column(name = "profile_id", nullable = false, updatable = false)
    private UUID profileId;

    /**
     * Full legal or preferred name of the user.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Optional nickname or display name.
     */
    private String nickname;

    /**
     * Professional occupation or job title.
     */
    @Column(columnDefinition = "text")
    private String occupation;

    /**
     * Base monthly salary or declared monthly income.
     */
    @Column(precision = 19, scale = 2)
    private BigDecimal salary;

    /**
     * Usual monthly salary receipt date.
     */
    @Column(name = "salary_date")
    private LocalDate salaryDate;

    /**
     * The parent user entity linked to this profile.
     */
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_profiles_user"))
    private User user;

    /**
     * The onboarding form responses linked to this profile.
     */
    @JsonIgnore
    @Setter(AccessLevel.NONE)
    @OneToOne(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private Form form;

    /**
     * Sets the onboarding form and maintains bidirectional relationship consistency.
     *
     * @param form the onboarding form entity to associate
     */
    public void setForm(Form form) {
        this.form = form;
        if (form != null && form.getProfile() != this) {
            form.setProfile(this);
        }
    }

    /**
     * Pre-persists a time-ordered epoch UUID before database insertion.
     */
    @PrePersist
    public void prePersist() {
        if (profileId == null) {
            profileId = UuidCreator.getTimeOrderedEpoch();
        }
    }
}