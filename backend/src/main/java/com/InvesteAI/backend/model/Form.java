package com.InvesteAI.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "form")
@Getter
@Setter
@NoArgsConstructor
public class Form {

    @Id
    @Column(name = "form_id", nullable = false, updatable = false)
    private UUID formId;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_forms_profile"))
    private Profile profile;

    @Column(name = "hear_about_us", columnDefinition = "text")
    private String hearAboutUs;

    @Column(name = "how_wants_to_use", columnDefinition = "text")
    private String howWantsToUse;

    @Column(name = "open_finance", nullable = false)
    private Boolean openFinance = false;

    @Column(name = "current_banks", columnDefinition = "text")
    private String currentBanks;

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
