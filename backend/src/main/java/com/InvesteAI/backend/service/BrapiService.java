package com.InvesteAI.backend.service;

import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.ArrayList;
import java.util.List;

@Service
public class BrapiService {
    private final RestClient client;
    private final String apiKey;

    public BrapiService(@Value("${brapi.api-key}") String apiKey) {
        this.client = RestClient.create("https://brapi.dev");
        this.apiKey = apiKey;
    }

    public synchronized List<JsonNode> getQuotes(List<String> symbols) {
        List<JsonNode> quotes = new ArrayList<>();

        for (String symbol : symbols) {
            JsonNode response = client.get()
                    .uri(uri -> uri
                            .path("/api/v2/stocks/quote")
                            .queryParam("symbols", symbol)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.path("results").isArray()) {
                throw new IllegalStateException("A resposta da brapi não contém a lista de cotações esperada.");
            }

            response.path("results").forEach(quotes::add);
        }

        return quotes;
    }

    public synchronized List<JsonNode> getHistoricalData(String symbol, String range, String interval) {
        JsonNode response = client.get()
                .uri(uri -> uri
                        .path("/api/v2/stocks/historical")
                        .queryParam("symbols", symbol)
                        .queryParam("range", range)
                        .queryParam("interval", interval)
                        .queryParam("sortOrder", "asc")
                        .build())
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