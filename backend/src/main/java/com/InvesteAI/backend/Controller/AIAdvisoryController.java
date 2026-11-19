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

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIAdvisoryController {

    private final AIAdvisoryService aiAdvisoryService;

    @GetMapping("/profile")
    public ResponseEntity<RiskProfileResponse> getProfile(@CurrentUser UUID userId) {
        return ResponseEntity.ok(aiAdvisoryService.getProfile(userId));
    }

    @PostMapping("/profile/evaluate")
    public ResponseEntity<RiskProfileResponse> evaluateProfile(
            @CurrentUser UUID userId,
            @RequestBody EvaluateRiskProfileRequest request
    ) {
        return ResponseEntity.ok(aiAdvisoryService.evaluateProfile(userId, request));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@CurrentUser UUID userId) {
        return ResponseEntity.ok(aiAdvisoryService.getRecommendations(userId));
    }
}
