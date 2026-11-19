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

@RestController
@RequestMapping("/cashflow")
@RequiredArgsConstructor
public class CashFlowController {

    private final CashFlowService cashFlowService;

    @GetMapping
    public ResponseEntity<List<CashFlowResponse>> list(
            @CurrentUser UUID userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(cashFlowService.list(userId, month, year, type));
    }

    @PostMapping
    public ResponseEntity<CashFlowResponse> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateCashFlowRequest request
    ) {
        CashFlowResponse response = cashFlowService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<CashFlowSummaryResponse> getSummary(
            @CurrentUser UUID userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(cashFlowService.getSummary(userId, month, year));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashFlowResponse> getById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(cashFlowService.getById(userId, id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CashFlowResponse> update(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateCashFlowRequest request
    ) {
        return ResponseEntity.ok(cashFlowService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        cashFlowService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
