package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.service.BrapiService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvestmentControllerTest {

    @Mock
    private BrapiService brapiService;

    @InjectMocks
    private InvestmentController investmentController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void preservesBrapiQuotesResultsContract() throws Exception {
        JsonNode petr4 = objectMapper.readTree("""
                {
                    "symbol": "PETR4",
                    "shortName": "PETROBRAS PN N2",
                    "regularMarketPrice": 38.50,
                    "regularMarketChangePercent": 1.45,
                    "logourl": "https://s3-symbol-logo.tradingview.com/petrobras--big.svg"
                }
                """);
        when(brapiService.getQuotes(List.of("PETR4", "VALE3"))).thenReturn(List.of(petr4));

        Map<String, Object> response = investmentController.getQuotes("petr4,VALE3,PETR4");

        assertEquals(List.of(petr4), response.get("results"));
        assertEquals(List.of("VALE3"), response.get("unavailableSymbols"));
    }

    @Test
    void returnsTradingDateSeparatelyFromRequestedDate() {
        LocalDate sunday = LocalDate.of(2025, 6, 8);
        var quote = new BrapiService.ReferencePrice(sunday.minusDays(2), "38.50", false);
        when(brapiService.getReferencePrice("PETR4", sunday)).thenReturn(Optional.of(quote));

        assertEquals(quote, investmentController.getReferencePrice(" petr4 ", sunday));
    }

    @Test
    void returnsNotFoundWhenNoTradingSessionIsAvailable() {
        LocalDate date = LocalDate.of(2025, 6, 8);
        when(brapiService.getReferencePrice("PETR4", date)).thenReturn(Optional.empty());

        var error = assertThrows(ResponseStatusException.class,
                () -> investmentController.getReferencePrice("PETR4", date));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void preservesBrapiMarketSearchResultsContract() throws Exception {
        JsonNode asset = objectMapper.readTree("""
                {
                    "stock": "PETR4",
                    "name": "PETROBRAS",
                    "close": 38.50,
                    "change": 1.45
                }
                """);
        when(brapiService.search("PETR")).thenReturn(List.of(asset));

        Map<String, List<JsonNode>> response = investmentController.searchMarket("PETR");

        assertNotNull(response.get("results"));
        assertEquals(1, response.get("results").size());
        assertEquals("PETR4", response.get("results").get(0).path("stock").asText());
    }
}
