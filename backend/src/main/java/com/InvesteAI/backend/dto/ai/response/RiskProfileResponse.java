package com.InvesteAI.backend.dto.ai.response;

import java.util.List;
import java.util.Map;

public record RiskProfileResponse(
        String profile,
        String riskTolerance,
        String summary,
        List<String> objectives,
        Map<String, Double> suggestedAllocation
) {}
