package com.InvesteAI.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class BrapiServiceTest {

    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final BrapiService service = new BrapiService("test-token", builder);

    @Test
    void usesLastClosingPriceOnOrBeforeRequestedDate() {
        server.expect(requestTo("https://brapi.dev/api/v2/stocks/historical?symbols=PETR4"
                        + "&interval=1d&sortOrder=asc&startDate=2026-05-31&endDate=2026-06-14"))
                .andRespond(withSuccess("""
                        {"results":[{"data":{"historicalDataPrice":[
                            {"date":1781492400,"close":42},
                            {"date":1781233200,"close":41.18},
                            {"date":1781146800,"close":39}
                        ]}}]}
                        """, MediaType.APPLICATION_JSON));

        var quote = service.getReferencePrice("PETR4", LocalDate.of(2026, 6, 14)).orElseThrow();
        assertEquals(LocalDate.of(2026, 6, 12), quote.tradingDate());
        assertEquals("41.18", quote.price());
        server.verify();
    }

    @Test
    void exposesV2QuoteFieldsInExistingClientFormat() {
        server.expect(requestTo("https://brapi.dev/api/v2/stocks/quote?symbols=PETR4"))
                .andRespond(withSuccess("""
                        {"results":[{"symbol":"PETR4","data":{"regularMarketPrice":41.18}}]}
                        """, MediaType.APPLICATION_JSON));

        var quote = service.getQuotes(List.of("PETR4")).getFirst();
        assertEquals("PETR4", quote.path("symbol").asText());
        assertEquals(41.18, quote.path("regularMarketPrice").asDouble());
        server.verify();
    }
}
