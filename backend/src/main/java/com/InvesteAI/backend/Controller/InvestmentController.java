package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.service.BrapiService;
import tools.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
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
    public Map<String, List<JsonNode>> getQuotes(@RequestParam String symbols) {
        List<String> tickers = Arrays.stream(symbols.split(","))
                .map(String::trim)
                .toList();

        return Map.of("results", brapiService.getQuotes(tickers));
    }
}