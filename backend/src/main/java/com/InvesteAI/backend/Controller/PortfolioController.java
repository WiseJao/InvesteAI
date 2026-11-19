package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.investment.request.CreateHoldingRequest;
import com.InvesteAI.backend.dto.investment.request.UpdateHoldingRequest;
import com.InvesteAI.backend.dto.investment.response.HoldingResponse;
import com.InvesteAI.backend.dto.investment.response.PortfolioSummaryResponse;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@CurrentUser UUID userId) {
        return ResponseEntity.ok(investmentService.getPortfolioSummary(userId));
    }

    @GetMapping("/holdings")
    public ResponseEntity<List<HoldingResponse>> listHoldings(@CurrentUser UUID userId) {
        return ResponseEntity.ok(investmentService.listHoldings(userId));
    }

    @PostMapping("/holdings")
    public ResponseEntity<HoldingResponse> addHolding(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateHoldingRequest request
    ) {
        HoldingResponse response = investmentService.addHolding(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/holdings/{id}")
    public ResponseEntity<HoldingResponse> getHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(investmentService.getHolding(userId, id));
    }

    @PatchMapping("/holdings/{id}")
    public ResponseEntity<HoldingResponse> updateHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateHoldingRequest request
    ) {
        return ResponseEntity.ok(investmentService.updateHolding(userId, id, request));
    }

    @DeleteMapping("/holdings/{id}")
    public ResponseEntity<Void> deleteHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        investmentService.deleteHolding(userId, id);
        return ResponseEntity.noContent().build();
    }
}
