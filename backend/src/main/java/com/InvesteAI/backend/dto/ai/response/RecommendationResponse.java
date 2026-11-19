package com.InvesteAI.backend.dto.ai.response;

public record RecommendationResponse(
        String title,
        String symbol,
        String category,
        String risk,
        String description,
        String expectedReturn,
        String minInvestment
) {}
