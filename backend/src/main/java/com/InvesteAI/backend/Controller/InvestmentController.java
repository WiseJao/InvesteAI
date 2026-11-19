package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.service.BrapiService;
import tools.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/investments")
public class InvestmentController {
    private final BrapiService brapiService;

    public InvestmentController(BrapiService brapiService) {
        this.brapiService = brapiService;
    }

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

    @GetMapping("/market/search")
    public Map<String, List<JsonNode>> searchMarket(@RequestParam(name = "q", required = false) String query) {
        if (query == null || query.isBlank()) {
            return Map.of("results", Collections.emptyList());
        }
        return Map.of("results", brapiService.search(query));
    }
}