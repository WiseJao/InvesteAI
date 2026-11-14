package com.InvesteAI.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @Column(name = "profile_id", nullable = false, updatable = false)
    private UUID profileId;

    @Column(nullable = false)
    private String name;

    private String nickname;

    @Column(columnDefinition = "text")
    private String occupation;

    @Column(precision = 19, scale = 2)
    private BigDecimal salary;

    @Column(name = "salary_date")
    private LocalDate salaryDate;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_profiles_user"))
    private User user;

    @PrePersist
    public void prePersist() {
        if (profileId == null) {
            profileId = UuidCreator.getTimeOrderedEpoch();
        }
    }
}