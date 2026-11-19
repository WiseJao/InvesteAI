package com.InvesteAI.backend.dto.ai.request;

import java.util.List;

/**
 * Request payload for evaluating investor risk profile suitability.
 *
 * @param answers                    list of selected questionnaire answer choices
 * @param investmentExperienceYears  number of years of active investing experience
 * @param reactionToMarketDrop       declared behavior/reaction to a sudden market downturn
 * @param investmentHorizon          intended investment time horizon (e.g. curto, médio, longo prazo)
 */
public record EvaluateRiskProfileRequest(
        List<String> answers,
        Integer investmentExperienceYears,
        String reactionToMarketDrop,
        String investmentHorizon
) {}
