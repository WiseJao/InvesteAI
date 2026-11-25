package com.InvesteAI.backend.dto.ai.response;

/**
 * Response payload representing an AI-recommended financial asset.
 *
 * @param title          product title or name (e.g. Tesouro IPCA+ 2029)
 * @param symbol         ticker or product code
 * @param category       asset category (Renda Fixa, Ações, FIIs, etc.)
 * @param risk           qualitative risk indicator (Baixo, Médio, Alto)
 * @param description    rationale for recommending this asset
 * @param expectedReturn expected or benchmark yield indication
 * @param minInvestment  minimum investment entry ticket
 */
public record RecommendationResponse(
        String title,
        String symbol,
        String category,
        String risk,
        String description,
        String expectedReturn,
        String minInvestment
) {}
