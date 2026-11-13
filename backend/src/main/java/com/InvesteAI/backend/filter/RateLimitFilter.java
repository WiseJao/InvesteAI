package com.InvesteAI.backend.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based rate limiter (RNF-03 / UC-01 RE-03).
 *
 * <ul>
 *   <li>General bucket: {@code rate-limit.requests-per-minute} per IP (default 60).
 *   <li>Stricter bucket for credential endpoints ({@code /auth/login|google|register|refresh} and the
 *       password/e-mail change under {@code /users/me}):
 *       {@code rate-limit.auth-requests-per-minute} per IP (default 10) — slows brute force.
 *   <li>The client IP is {@link HttpServletRequest#getRemoteAddr()}. Behind a proxy,
 *       {@code server.forward-headers-strategy: native} makes Tomcat resolve it from
 *       X-Forwarded-For <b>only for trusted proxies</b>. The raw header is never read here,
 *       so clients cannot spoof it to dodge the limit.
 *   <li>Idle buckets are evicted so the map cannot grow without bound.
 * </ul>
 *
 * <p>For horizontal scaling move the buckets to a shared store.
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long IDLE_EVICT_MS  = Duration.ofMinutes(10).toMillis();
    private static final long SWEEP_EVERY_MS = Duration.ofMinutes(1).toMillis();

    private static final class Entry {
        final Bucket bucket;
        volatile long lastSeen = System.currentTimeMillis();
        Entry(Bucket bucket) { this.bucket = bucket; }
    }

    private final Map<String, Entry> buckets = new ConcurrentHashMap<>();
    private final int requestsPerMinute;
    private final int authRequestsPerMinute;
    private volatile long lastSweep = System.currentTimeMillis();

    public RateLimitFilter(
            @Value("${rate-limit.requests-per-minute:60}") int requestsPerMinute,
            @Value("${rate-limit.auth-requests-per-minute:10}") int authRequestsPerMinute) {
        this.requestsPerMinute     = requestsPerMinute;
        this.authRequestsPerMinute = authRequestsPerMinute;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         chain) throws ServletException, IOException {

        sweepIfDue();

        String  ip     = request.getRemoteAddr();
        boolean strict = isCredentialEndpoint(request);
        String  key    = (strict ? "auth|" : "gen|") + ip;
        int     limit  = strict ? authRequestsPerMinute : requestsPerMinute;

        Entry entry = buckets.computeIfAbsent(key, k -> new Entry(newBucket(limit)));
        entry.lastSeen = System.currentTimeMillis();

        if (entry.bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} ({})", ip, strict ? "auth" : "general");
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter()
                    .write("{\"status\":429,\"error\":\"Too Many Requests\"," +
                           "\"message\":\"Limite de requisições atingido. Tente novamente em 1 minuto.\"}");
        }
    }

    private boolean isCredentialEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Both ask for the current password, so they are as brute-forceable as login.
        if ("PUT".equalsIgnoreCase(request.getMethod())) {
            return "/users/me/password".equals(path) || "/users/me/email".equals(path);
        }
        if (!"POST".equalsIgnoreCase(request.getMethod())) return false;
        return "/auth/login".equals(path) || "/auth/google".equals(path) || "/auth/register".equals(path) || "/auth/refresh".equals(path);
    }

    private Bucket newBucket(int perMinute) {
        Bandwidth limit = Bandwidth.classic(perMinute, Refill.greedy(perMinute, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private void sweepIfDue() {
        long now = System.currentTimeMillis();
        if (now - lastSweep < SWEEP_EVERY_MS) return;
        lastSweep = now;
        buckets.entrySet().removeIf(e -> now - e.getValue().lastSeen > IDLE_EVICT_MS);
    }
}
