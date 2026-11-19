package com.InvesteAI.backend.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Documents the CPF input contract: accept a valid CPF with or without standard
 * punctuation, return eleven digits, and reject malformed or invalid check digits.
 */
class AuthIdentifiersTest {

    /**
     * Intent: formatted CPFs submitted during registration should be stored in a
     * canonical form that can be compared consistently with database values.
     * Setup: normalize a valid CPF using its standard punctuation.
     * Expected: the returned identifier contains exactly its eleven digits.
     */
    @Test
    void normalizesFormattedValidCpf() {
        assertEquals("52998224725", AuthIdentifiers.normalizeCpf("529.982.247-25"));
    }

    /**
     * Intent: users may submit an already canonical CPF without punctuation.
     * Setup: normalize a valid eleven-digit CPF.
     * Expected: it is returned unchanged.
     */
    @Test
    void acceptsCanonicalValidCpf() {
        assertEquals("52998224725", AuthIdentifiers.normalizeCpf("52998224725"));
    }

    /**
     * Intent: a correctly shaped number with invalid check digits must not be
     * accepted as a registration or login identifier.
     * Setup: submit a CPF with its final check digit changed.
     * Expected: normalization fails with a generic validation error.
     */
    @Test
    void rejectsInvalidCheckDigits() {
        assertThrows(IllegalArgumentException.class,
                () -> AuthIdentifiers.normalizeCpf("529.982.247-24"));
    }

    /**
     * Intent: repeated-digit sequences are not valid CPFs even if their length is
     * correct.
     * Setup: submit eleven repeated digits.
     * Expected: normalization rejects the value.
     */
    @Test
    void rejectsRepeatedDigits() {
        assertThrows(IllegalArgumentException.class,
                () -> AuthIdentifiers.normalizeCpf("111.111.111-11"));
    }

    /**
     * Intent: only standard CPF punctuation may be removed; arbitrary characters
     * and incomplete identifiers must not be silently accepted.
     * Setup: submit an identifier containing an internal space.
     * Expected: normalization rejects the malformed value.
     */
    @Test
    void rejectsUnexpectedCharacters() {
        assertThrows(IllegalArgumentException.class,
                () -> AuthIdentifiers.normalizeCpf("529 982 247 25"));
    }
}