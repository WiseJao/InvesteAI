package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.cashflow.request.CreateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.request.UpdateCashFlowRequest;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowResponse;
import com.InvesteAI.backend.dto.cashflow.response.CashFlowSummaryResponse;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.CashFlowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for cash flow transactions and monthly budget summaries.
 * <p>
 * Provides endpoints to record, list, update, delete, and aggregate income and expense entries
 * for the authenticated user, supporting budget comparisons and category breakdowns.
 * </p>
 */
@RestController
@RequestMapping("/cashflow")
@RequiredArgsConstructor
public class CashFlowController {

    private final CashFlowService cashFlowService;

    /**
     * Lists cash flow entries for the authenticated user with optional date range and type filtering.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param month  optional month filter (1-12)
     * @param year   optional 4-digit year filter (e.g. 2026)
     * @param type   optional filter by classification (FIXED, VARIABLE) or direction (INCOME, EXPENSE)
     * @return {@link ResponseEntity} containing a list of {@link CashFlowResponse} entries
     */
    @GetMapping
    public ResponseEntity<List<CashFlowResponse>> list(
            @CurrentUser UUID userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(cashFlowService.list(userId, month, year, type));
    }

    /**
     * Creates a new cash flow transaction (income or expense) for the authenticated user.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param request the transaction creation payload
     * @return {@link ResponseEntity} with HTTP 201 Created containing the saved transaction
     */
    @PostMapping
    public ResponseEntity<CashFlowResponse> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateCashFlowRequest request
    ) {
        CashFlowResponse response = cashFlowService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves monthly budget statistics, total spending, and category distribution percentages.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param month  optional target month (defaults to current month)
     * @param year   optional target year (defaults to current year)
     * @return {@link ResponseEntity} containing {@link CashFlowSummaryResponse}
     */
    @GetMapping("/summary")
    public ResponseEntity<CashFlowSummaryResponse> getSummary(
            @CurrentUser UUID userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(cashFlowService.getSummary(userId, month, year));
    }

    /**
     * Retrieves the details of a single cash flow transaction by its unique identifier.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the unique UUID of the cash flow record
     * @return {@link ResponseEntity} containing the transaction details
     */
    @GetMapping("/{id}")
    public ResponseEntity<CashFlowResponse> getById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(cashFlowService.getById(userId, id));
    }

    /**
     * Partially updates an existing cash flow transaction.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param id      the unique UUID of the cash flow record to update
     * @param request the partial update payload
     * @return {@link ResponseEntity} containing the updated cash flow details
     */
    @PatchMapping("/{id}")
    public ResponseEntity<CashFlowResponse> update(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateCashFlowRequest request
    ) {
        return ResponseEntity.ok(cashFlowService.update(userId, id, request));
    }

    /**
     * Deletes a cash flow transaction belonging to the authenticated user.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the unique UUID of the cash flow record to delete
     * @return {@link ResponseEntity} with HTTP 204 No Content status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        cashFlowService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
