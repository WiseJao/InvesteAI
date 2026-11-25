package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Documents the legacy user API boundary: entity-based create/update routes are
 * removed and direct entity serialization must not reveal CPF or password hashes.
 */
class LegacyUserEndpointProtectionTest {

    /**
     * Intent: raw user entities must not be accepted through the legacy controller,
     * because doing so bypasses CPF validation and password hashing.
     * Setup: inspect the controller's mapped methods.
     * Expected: no POST registration or PUT update handler remains.
     */
    @Test
    void hasNoRawEntityCreateOrUpdateEndpoint() {
        assertFalse(Arrays.stream(UserController.class.getDeclaredMethods())
                .anyMatch(method -> method.isAnnotationPresent(PostMapping.class)
                        && Arrays.asList(method.getParameterTypes()).contains(User.class)
                        || method.isAnnotationPresent(PutMapping.class)));
    }

    /**
     * Intent: legacy reads must not serialize authentication secrets or CPF values.
     * Setup: serialize an entity populated with recognizable secret values.
     * Expected: the response contains neither value while retaining non-secret fields.
     */
    @Test
    void omitsCpfAndPasswordHashFromEntityJson() throws Exception {
        User user = new User();
        user.setEmail("person@example.com");
        user.setCpf("52998224725");
        user.setPasswordHash("encoded-secret-hash");

        String json = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .writeValueAsString(user);

        assertTrue(json.contains("person@example.com"));
        assertFalse(json.contains("52998224725"));
        assertFalse(json.contains("encoded-secret-hash"));
        assertFalse(json.contains("passwordHash"));
    }
}