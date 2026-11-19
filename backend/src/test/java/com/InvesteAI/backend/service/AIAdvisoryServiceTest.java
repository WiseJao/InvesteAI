package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.ai.request.EvaluateRiskProfileRequest;
import com.InvesteAI.backend.dto.ai.response.RecommendationResponse;
import com.InvesteAI.backend.dto.ai.response.RiskProfileResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AIAdvisoryServiceTest {

    private final AIAdvisoryService aiAdvisoryService = new AIAdvisoryService();

    @Test
    void returnsDefaultInvestorProfile() {
        UUID userId = UUID.randomUUID();
        RiskProfileResponse profile = aiAdvisoryService.getProfile(userId);

        assertEquals("Moderado", profile.profile());
        assertEquals("Média", profile.riskTolerance());
        assertNotNull(profile.suggestedAllocation());
        assertEquals(45.0, profile.suggestedAllocation().get("Renda Fixa"));
        assertEquals(35.0, profile.suggestedAllocation().get("Ações"));
    }

    @Test
    void evaluatesAggressiveInvestorProfile() {
        UUID userId = UUID.randomUUID();
        EvaluateRiskProfileRequest request = new EvaluateRiskProfileRequest(
                List.of("Crescimento rápido"),
                8,
                "Compro mais na queda",
                "Longo prazo (10+ anos)"
        );

        RiskProfileResponse profile = aiAdvisoryService.evaluateProfile(userId, request);

        assertEquals("Arrojado", profile.profile());
        assertEquals("Alta", profile.riskTolerance());
    }

    @Test
    void returnsCuratedRecommendations() {
        UUID userId = UUID.randomUUID();
        List<RecommendationResponse> recommendations = aiAdvisoryService.getRecommendations(userId);

        assertFalse(recommendations.isEmpty());
        assertEquals(4, recommendations.size());
    }
}
