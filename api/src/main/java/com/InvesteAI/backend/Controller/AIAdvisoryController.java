package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.ai.request.EvaluateRiskProfileRequest;
import com.InvesteAI.backend.dto.ai.response.RecommendationResponse;
import com.InvesteAI.backend.dto.ai.response.RiskProfileResponse;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.AIAdvisoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for AI advisory services, risk profile analysis, and personalized asset recommendations.
 * <p>
 * Exposes endpoints for calculating investor suitability profiles, retrieving target asset allocations,
 * and fetching tailored investment product recommendations.
 * </p>
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIAdvisoryController {

    private final AIAdvisoryService aiAdvisoryService;

    /**
     * Retrieves the current AI-determined risk profile and suggested asset allocation for the authenticated user.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing {@link RiskProfileResponse}
     */
    @GetMapping("/profile")
    public ResponseEntity<RiskProfileResponse> getProfile(@CurrentUser UUID userId) {
        return ResponseEntity.ok(aiAdvisoryService.getProfile(userId));
    }

    /**
     * Submits a risk tolerance questionnaire and calculates an updated investor risk profile classification.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param request the questionnaire responses and risk preference answers
     * @return {@link ResponseEntity} containing the evaluated {@link RiskProfileResponse}
     */
    @PostMapping("/profile/evaluate")
    public ResponseEntity<RiskProfileResponse> evaluateProfile(
            @CurrentUser UUID userId,
            @RequestBody EvaluateRiskProfileRequest request
    ) {
        return ResponseEntity.ok(aiAdvisoryService.evaluateProfile(userId, request));
    }

    /**
     * Retrieves a curated list of AI-driven investment recommendations tailored to the user's risk profile.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing a list of {@link RecommendationResponse} items
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@CurrentUser UUID userId) {
        return ResponseEntity.ok(aiAdvisoryService.getRecommendations(userId));
    }
}
