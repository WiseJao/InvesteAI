package com.InvesteAI.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private static final int    MIN_SECRET_BYTES = 32;
    private static final String CLAIM_TYPE    = "type";
    private static final String TYPE_ACCESS   = "access";
    private static final String TYPE_REFRESH  = "refresh";

    private final SecretKey key;
    private final long      accessMs;
    private final long      refreshMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-ms}") long accessMs,
            @Value("${jwt.refresh-token-expiration-ms}") long refreshMs) {
        byte[] secretBytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_BYTES || secret.startsWith("CHANGE_THIS")) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set and at least " + MIN_SECRET_BYTES + " bytes long.");
        }
        this.key       = Keys.hmacShaKeyFor(secretBytes);
        this.accessMs  = accessMs;
        this.refreshMs = refreshMs;
    }

    // ── Generation ────────────────────────────────────────────────────────────

    public String generateAccessToken(UUID userId) {
        return build(userId.toString(), TYPE_ACCESS, accessMs);
    }

    public String generateRefreshToken(UUID userId) {
        return build(userId.toString(), TYPE_REFRESH, refreshMs);
    }

    private String build(String subject, String type, long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())   // jti — makes every token unique
                .subject(subject)
                .claim(CLAIM_TYPE, type)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(key)
                .compact();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    public UUID extractUserId(String token) {
        return UUID.fromString(claims(token).getSubject());
    }

    /** Expiration instant of a (valid, signed) token. */
    public Instant extractExpiration(String token) {
        return claims(token).getExpiration().toInstant();
    }

    public boolean isValidAccessToken(String token) {
        try {
            return TYPE_ACCESS.equals(claims(token).get(CLAIM_TYPE, String.class));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isValidRefreshToken(String token) {
        try {
            return TYPE_REFRESH.equals(claims(token).get(CLAIM_TYPE, String.class));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
