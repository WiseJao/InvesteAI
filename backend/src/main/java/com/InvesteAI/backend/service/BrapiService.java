package com.InvesteAI.backend.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for communicating with the external BRAPI market data API with in-memory caching.
 * <p>
 * Proxies stock quote lookups and asset search queries while applying a time-to-live (TTL) cache
 * to preserve upstream rate limits and improve frontend response latencies.
 * </p>
 */
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

    /**
     * Constructs the {@link BrapiService} configuring base API URL and optional API token.
     *
     * @param apiKey the BRAPI authorization token configured in application properties
     */
    @Autowired
    public BrapiService(@Value("${brapi.api-key:}") String apiKey) {
        this(apiKey, RestClient.builder());
    }

    BrapiService(String apiKey, RestClient.Builder builder) {
        this.client = builder
                .baseUrl("https://brapi.dev")
                .build();
        this.apiKey = apiKey;
    }

    /**
     * Fetches market quote JSON nodes for the specified ticker symbols with automatic caching.
     *
     * @param symbols list of ticker symbol strings (e.g. {@code ["PETR4", "VALE3"]})
     * @return list of quote {@link JsonNode} items exactly matching BRAPI output
     */
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
                        response.path("results").forEach(result -> {
                            if (result.path("data") instanceof ObjectNode data
                                    && result.path("symbol").isTextual()) {
                                ObjectNode quote = data.deepCopy();
                                quote.set("symbol", result.path("symbol"));
                                symbolResults.add(quote);
                            }
                        });
                        if (symbolResults.isEmpty()) {
                            throw new IllegalStateException("A BRAPI não retornou cotação para o ativo.");
                        }
                        quoteCache.put(symbol, new CacheEntry<>(symbolResults, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
                        quotes.addAll(symbolResults);
                    } else {
                        throw new IllegalStateException("Resposta de cotação inválida.");
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

    /**
     * Searches tickers and names matching the query string from BRAPI with automatic caching.
     *
     * @param query substring search query
     * @return list of matching ticker {@link JsonNode} objects
     */
    public List<JsonNode> search(String query) {
        if (query == null || query.trim().isBlank()) {
            return Collections.emptyList();
        }

        String q = query.trim().toUpperCase();
        CacheEntry<List<JsonNode>> cached = searchCache.get(q);
        if (cached != null && cached.isValid()) {
            return cached.data();
        }

        List<JsonNode> searchResults;
        try {
            JsonNode response = client.get()
                    .uri(uri -> uri
                            .path("/api/v2/stocks/list")
                            .queryParam("search", q)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            searchResults = parseSearchResults(response);
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

                searchResults = parseSearchResults(response);
            } catch (Exception ex) {
                ex.addSuppressed(e);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha na busca de ativos da BRAPI", ex);
            }
        }

        searchCache.put(q, new CacheEntry<>(searchResults, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
        return searchResults;
    }

    private List<JsonNode> parseSearchResults(JsonNode response) {
        JsonNode results = response == null ? null : response.isArray() ? response
                : response.path("results").isArray() ? response.path("results") : response.path("stocks");
        if (results == null || !results.isArray()) {
            throw new IllegalStateException("A resposta da BRAPI não contém uma lista de ativos.");
        }
        List<JsonNode> searchResults = new ArrayList<>();
        results.forEach(searchResults::add);
        return searchResults;
    }

    public record ReferencePrice(LocalDate tradingDate, String price, boolean raw) {}

    public Optional<ReferencePrice> getReferencePrice(String symbol, LocalDate date) {
        LocalDate start = date.minusDays(14);
        try {
            return fetchHistory(symbol, null, "1d", start, date).stream()
                    .filter(point -> point.path("date").isIntegralNumber())
                    .map(point -> {
                        LocalDate tradingDate = Instant.ofEpochSecond(point.path("date").asLong())
                                .atZone(ZoneId.of("America/Sao_Paulo")).toLocalDate();
                        JsonNode raw = point.path("rawClose");
                        JsonNode close = raw.isNumber() ? raw : point.path("close");
                        BigDecimal price = close.isNumber() ? close.decimalValue() : BigDecimal.ZERO;
                        return new ReferencePrice(tradingDate, price.toPlainString(), raw.isNumber());
                    })
                    .filter(price -> !price.tradingDate().isBefore(start) && !price.tradingDate().isAfter(date))
                    .filter(price -> new BigDecimal(price.price()).signum() > 0)
                    .max(Comparator.comparing(ReferencePrice::tradingDate));
        } catch (RestClientException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Histórico da BRAPI indisponível.", e);
        }
    }

    public List<JsonNode> getHistoricalData(String symbol, String range, String interval) {
        return fetchHistory(symbol, range, interval, null, null);
    }

    private List<JsonNode> fetchHistory(String symbol, String range, String interval, LocalDate start, LocalDate end) {
        JsonNode response = client.get()
                .uri(uri -> {
                    uri
                        .path("/api/v2/stocks/historical")
                        .queryParam("symbols", symbol)
                        .queryParam("interval", interval)
                        .queryParam("sortOrder", "asc");
                    if (start != null) {
                        uri.queryParam("startDate", start).queryParam("endDate", end);
                    } else {
                        uri.queryParam("range", range);
                    }
                    return uri.build();
                })
                .header("Authorization", "Bearer " + apiKey)
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.path("results").isArray()) {
            throw new IllegalStateException("A resposta da brapi não contém a lista de histórico esperada.");
        }

        JsonNode results = response.path("results");
        if (results.isEmpty()) {
            return List.of();
        }

        JsonNode historicalData = results.get(0).path("data").path("historicalDataPrice");
        if (!historicalData.isArray()) {
            throw new IllegalStateException("A resposta da brapi não contém os pontos do histórico esperados.");
        }

        List<JsonNode> points = new ArrayList<>();
        historicalData.forEach(points::add);
        return points;
    }
}
