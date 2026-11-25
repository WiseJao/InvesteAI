package com.InvesteAI.backend.dto.ai.response;

import java.util.List;
import java.util.Map;

/**
 * Response payload representing an investor's risk profile suitability and target allocation.
 *
 * @param profile             profile classification name (Conservador, Moderado, Arrojado)
 * @param riskTolerance       qualitative risk tolerance level (Baixa, Média, Alta)
 * @param summary             narrative explanation of the investor's profile and mindset
 * @param objectives          primary strategic investment objectives
 * @param suggestedAllocation suggested portfolio percentage distribution across asset classes
 */
public record RiskProfileResponse(
        String profile,
        String riskTolerance,
        String summary,
        List<String> objectives,
        Map<String, Double> suggestedAllocation
) {}
