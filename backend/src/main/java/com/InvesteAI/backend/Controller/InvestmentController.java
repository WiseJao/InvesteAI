package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.service.BrapiService;
import tools.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST controller acting as a proxy for live market data and asset searches via BRAPI.
 * <p>
 * Returns quotes and ticker search results maintaining the exact upstream BRAPI JSON structure
 * (under the standard {@code {"results": [...]}} key).
 * </p>
 */
@RestController
@RequestMapping("/investments")
public class InvestmentController {
    private final BrapiService brapiService;

    public InvestmentController(BrapiService brapiService) {
        this.brapiService = brapiService;
    }

    /**
     * Fetches current market quotes and financial summaries for one or more comma-separated tickers.
     *
     * @param symbols comma-separated asset tickers (e.g. {@code "PETR4,VALE3,ITUB4"})
     * @return map containing the list of market quote objects under the {@code "results"} key
     */
    @GetMapping("/quotes")
    public Map<String, List<JsonNode>> getQuotes(@RequestParam(required = false) String symbols) {
        if (symbols == null || symbols.isBlank()) {
            return Map.of("results", Collections.emptyList());
        }
        List<String> tickers = Arrays.stream(symbols.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        return Map.of("results", brapiService.getQuotes(tickers));
    }

    /**
     * Searches available tickers and company names on the market for auto-complete.
     *
     * @param query search query substring (e.g. {@code "PETR"})
     * @return map containing the list of matching assets under the {@code "results"} key
     */
    @GetMapping("/market/search")
    public Map<String, List<JsonNode>> searchMarket(@RequestParam(name = "q", required = false) String query) {
        if (query == null || query.isBlank()) {
            return Map.of("results", Collections.emptyList());
        }
        return Map.of("results", brapiService.search(query));
    }
}