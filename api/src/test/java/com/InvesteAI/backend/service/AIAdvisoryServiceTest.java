package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.ai.request.EvaluateRiskProfileRequest;
import com.InvesteAI.backend.dto.ai.response.RecommendationResponse;
import com.InvesteAI.backend.dto.ai.response.RiskProfileResponse;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AIAdvisoryServiceTest {

    private final UserInterface userRepository = mock(UserInterface.class);
    private final AIAdvisoryService aiAdvisoryService = new AIAdvisoryService(userRepository);

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

        User user = new User();
        user.setProfile(new Profile());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        RiskProfileResponse profile = aiAdvisoryService.evaluateProfile(userId, request);

        assertEquals("Arrojado", profile.profile());
        assertEquals("Alta", profile.riskTolerance());
        assertEquals(profile, aiAdvisoryService.getProfile(userId));
    }

    @Test
    void returnsCuratedRecommendations() {
        UUID userId = UUID.randomUUID();
        List<RecommendationResponse> recommendations = aiAdvisoryService.getRecommendations(userId);

        assertFalse(recommendations.isEmpty());
        assertEquals(4, recommendations.size());
    }
}
