package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.service.BrapiService;
import tools.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/investments")
public class InvestmentController {
    private final BrapiService brapiService;

    public InvestmentController(BrapiService brapiService) {
        this.brapiService = brapiService;
    }

    @GetMapping("/quotes")
    public Map<String, List<JsonNode>> getQuotes(@RequestParam String symbols) {
        List<String> tickers = Arrays.stream(symbols.split(","))
                .map(String::trim)
                .toList();

        return Map.of("results", brapiService.getQuotes(tickers));
    }

    @GetMapping("/history")
    public Map<String, List<JsonNode>> getHistory(
            @RequestParam String symbol,
            @RequestParam String range) {
        String ticker = symbol.trim().toUpperCase(Locale.ROOT);
        if (!ticker.matches("[A-Z0-9.-]{1,15}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticker inválido.");
        }

        String interval = switch (range) {
            case "1d", "5d", "1mo", "3mo" -> "1d";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Período inválido.");
        };

        return Map.of("results", brapiService.getHistoricalData(ticker, range, interval));
    }
}