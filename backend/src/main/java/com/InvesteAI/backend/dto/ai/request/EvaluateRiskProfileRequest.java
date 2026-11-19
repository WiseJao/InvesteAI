package com.InvesteAI.backend.dto.ai.request;

import java.util.List;

public record EvaluateRiskProfileRequest(
        List<String> answers,
        Integer investmentExperienceYears,
        String reactionToMarketDrop,
        String investmentHorizon
) {}
