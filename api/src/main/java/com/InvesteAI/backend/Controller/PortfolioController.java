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

/**
 * REST controller for managing user investment portfolio holdings and aggregate positions.
 * <p>
 * Provides endpoints for viewing overall portfolio equity and allocation breakdowns,
 * as well as CRUD operations for individual asset holdings.
 * </p>
 */
@RestController
@RequestMapping("/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final InvestmentService investmentService;

    /**
     * Retrieves the aggregate portfolio summary including total invested, current valuation,
     * total profit/loss, and asset allocation percentages.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing {@link PortfolioSummaryResponse}
     */
    @GetMapping
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@CurrentUser UUID userId) {
        return ResponseEntity.ok(investmentService.getPortfolioSummary(userId));
    }

    /**
     * Lists all registered investment holdings belonging to the authenticated user.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing a list of {@link HoldingResponse} items
     */
    @GetMapping("/holdings")
    public ResponseEntity<List<HoldingResponse>> listHoldings(@CurrentUser UUID userId) {
        return ResponseEntity.ok(investmentService.listHoldings(userId));
    }

    /**
     * Adds a new investment asset holding to the user's portfolio.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param request the holding creation payload
     * @return {@link ResponseEntity} with HTTP 201 Created containing the saved holding
     */
    @PostMapping("/holdings")
    public ResponseEntity<HoldingResponse> addHolding(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateHoldingRequest request
    ) {
        HoldingResponse response = investmentService.addHolding(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a single investment holding by its unique identifier.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the UUID of the investment holding
     * @return {@link ResponseEntity} containing {@link HoldingResponse}
     */
    @GetMapping("/holdings/{id}")
    public ResponseEntity<HoldingResponse> getHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(investmentService.getHolding(userId, id));
    }

    /**
     * Partially updates an existing investment holding.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param id      the UUID of the investment holding to update
     * @param request the update fields payload
     * @return {@link ResponseEntity} containing the updated holding
     */
    @PatchMapping("/holdings/{id}")
    public ResponseEntity<HoldingResponse> updateHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateHoldingRequest request
    ) {
        return ResponseEntity.ok(investmentService.updateHolding(userId, id, request));
    }

    /**
     * Deletes an investment holding from the authenticated user's portfolio.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the UUID of the holding to remove
     * @return {@link ResponseEntity} with HTTP 204 No Content status
     */
    @DeleteMapping("/holdings/{id}")
    public ResponseEntity<Void> deleteHolding(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        investmentService.deleteHolding(userId, id);
        return ResponseEntity.noContent().build();
    }
}
