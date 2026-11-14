package com.InvesteAI.backend.model;

import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifies the user/profile ownership mapping using Hibernate's generated H2 schema.
 * This covers ORM persistence and the one-profile-per-user constraint; it does not
 * substitute for executing the PostgreSQL-specific Flyway migration.
 */
@DataJpaTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserProfilePersistenceTest {

    @Autowired
    private TestEntityManager entityManager;

    /**
     * Intent: registration must be able to persist a profile through its user and
     * the two records must not share an identifier.
     * Setup: persist a user with a cascaded profile, then reload the profile.
     * Expected: both independent UUIDs exist and the profile points to its owner.
     */
    @Test
    void persistsProfileWithIndependentIdAndOwningUser() {
        User user = userWithProfile();
        entityManager.persistAndFlush(user);

        Profile profile = entityManager.find(Profile.class, user.getProfile().getProfileId());

        assertNotNull(user.getId());
        assertNotNull(profile);
        assertNotNull(profile.getProfileId());
        assertNotEquals(user.getId(), profile.getProfileId());
        assertEquals(user.getId(), profile.getUser().getId());
    }

    /**
     * Intent: a user may own at most one profile even if a second profile is
     * persisted directly rather than through the user's inverse association.
     * Setup: persist one user/profile pair, then persist another profile for that user.
     * Expected: the unique user foreign-key constraint rejects the second profile.
     */
    @Test
    void rejectsASecondProfileForTheSameUser() {
        User user = userWithProfile();
        entityManager.persistAndFlush(user);

        Profile secondProfile = new Profile();
        secondProfile.setName("Another profile");
        secondProfile.setUser(user);

        assertThrows(PersistenceException.class, () -> entityManager.persistAndFlush(secondProfile));
    }

    /**
     * Intent: CPF uniqueness must be enforced by persistence, including when a
     * duplicate reaches the database after an application-level availability check.
     * Setup: persist one user, then persist another user with the same canonical CPF.
     * Expected: the unique CPF constraint rejects the second user.
     */
    @Test
    void rejectsDuplicateCpf() {
        User firstUser = userWithProfile();
        entityManager.persistAndFlush(firstUser);

        User secondUser = userWithProfile();
        secondUser.setEmail("another@example.com");

        assertThrows(PersistenceException.class, () -> entityManager.persistAndFlush(secondUser));
    }

    private static User userWithProfile() {
        User user = new User();
        user.setEmail("person@example.com");
        user.setCpf("52998224725");
        user.setPasswordHash("encoded-test-hash");

        Profile profile = new Profile();
        profile.setName("Person");
        user.setProfile(profile);
        return user;
    }
}