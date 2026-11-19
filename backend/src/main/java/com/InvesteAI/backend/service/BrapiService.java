package com.InvesteAI.backend.service;

import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BrapiService {

    private final RestClient client;
    private final String apiKey;
    private final Map<String, CacheEntry<List<JsonNode>>> quoteCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<List<JsonNode>>> searchCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_SECONDS = 60;

    private record CacheEntry<T>(T data, Instant expiresAt) {
        boolean isValid() {
            return Instant.now().isBefore(expiresAt);
        }
    }

    public BrapiService(@Value("${brapi.api-key:}") String apiKey) {
        this.client = RestClient.builder()
                .baseUrl("https://brapi.dev")
                .build();
        this.apiKey = apiKey;
    }

    public List<JsonNode> getQuotes(List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            return Collections.emptyList();
        }

        List<JsonNode> quotes = new ArrayList<>();
        List<String> missingSymbols = new ArrayList<>();

        for (String symbol : symbols) {
            String upper = symbol.trim().toUpperCase();
            if (upper.isBlank()) continue;

            CacheEntry<List<JsonNode>> cached = quoteCache.get(upper);
            if (cached != null && cached.isValid()) {
                quotes.addAll(cached.data());
            } else {
                missingSymbols.add(upper);
            }
        }

        if (!missingSymbols.isEmpty()) {
            for (String symbol : missingSymbols) {
                try {
                    JsonNode response = client.get()
                            .uri(uri -> uri
                                    .path("/api/v2/stocks/quote")
                                    .queryParam("symbols", symbol)
                                    .build())
                            .header("Authorization", "Bearer " + apiKey)
                            .retrieve()
                            .body(JsonNode.class);

                    if (response != null && response.path("results").isArray()) {
                        List<JsonNode> symbolResults = new ArrayList<>();
                        response.path("results").forEach(symbolResults::add);
                        quoteCache.put(symbol, new CacheEntry<>(symbolResults, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
                        quotes.addAll(symbolResults);
                    }
                } catch (Exception e) {
                    try {
                        JsonNode response = client.get()
                                .uri(uri -> uri
                                        .path("/api/quote/" + symbol)
                                        .build())
                                .header("Authorization", "Bearer " + apiKey)
                                .retrieve()
                                .body(JsonNode.class);

                        if (response != null && response.path("results").isArray()) {
                            List<JsonNode> symbolResults = new ArrayList<>();
                            response.path("results").forEach(symbolResults::add);
                            quoteCache.put(symbol, new CacheEntry<>(symbolResults, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
                            quotes.addAll(symbolResults);
                        }
                    } catch (Exception ex) {
                        // Gracefully skip symbol if not available upstream
                    }
                }
            }
        }

        return quotes;
    }

    public List<JsonNode> search(String query) {
        if (query == null || query.trim().isBlank()) {
            return Collections.emptyList();
        }

        String q = query.trim().toUpperCase();
        CacheEntry<List<JsonNode>> cached = searchCache.get(q);
        if (cached != null && cached.isValid()) {
            return cached.data();
        }

        List<JsonNode> searchResults = new ArrayList<>();
        try {
            JsonNode response = client.get()
                    .uri(uri -> uri
                            .path("/api/v2/stocks/list")
                            .queryParam("search", q)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.path("results").isArray()) {
                response.path("results").forEach(searchResults::add);
            } else if (response != null && response.isArray()) {
                response.forEach(searchResults::add);
            }
        } catch (Exception e) {
            try {
                JsonNode response = client.get()
                        .uri(uri -> uri
                                .path("/api/quote/list")
                                .queryParam("search", q)
                                .build())
                        .header("Authorization", "Bearer " + apiKey)
                        .retrieve()
                        .body(JsonNode.class);

                if (response != null && response.path("results").isArray()) {
                    response.path("results").forEach(searchResults::add);
                }
            } catch (Exception ex) {
                // Graceful fallback
            }
        }

        searchCache.put(q, new CacheEntry<>(searchResults, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
        return searchResults;
    }
}