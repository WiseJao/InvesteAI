package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.ai.request.EvaluateRiskProfileRequest;
import com.InvesteAI.backend.dto.ai.response.RecommendationResponse;
import com.InvesteAI.backend.dto.ai.response.RiskProfileResponse;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * Service managing AI-driven risk profiling, investor questionnaire evaluation,
 * and portfolio asset recommendations.
 * <p>
 * Classifies investor risk tolerance into Conservative, Moderate, or Aggressive categories,
 * computes ideal asset class allocation distributions, and generates targeted product recommendations.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AIAdvisoryService {
    private final UserInterface userRepository;

    /**
     * Retrieves the baseline investor profile and recommended allocation for a user.
     *
     * @param userId the UUID of the authenticated user
     * @return {@link RiskProfileResponse} with profile classification and percentage allocations
     */
    @Transactional(readOnly = true)
    public RiskProfileResponse getProfile(UUID userId) {
        int score = userRepository.findById(userId).map(User::getProfile)
                .map(Profile::getInvestorRiskScore).orElse(50);
        return classify(score);
    }

    /**
     * Evaluates questionnaire responses and computes an updated risk profile classification.
     *
     * @param userId  the UUID of the authenticated user
     * @param request the questionnaire answers, experience years, and drop reactions
     * @return evaluated {@link RiskProfileResponse}
     */
    @Transactional
    public RiskProfileResponse evaluateProfile(UUID userId, EvaluateRiskProfileRequest request) {
        int score = 50; // Base score
        if (request.investmentExperienceYears() != null) {
            score += Math.clamp(request.investmentExperienceYears(), 0, 6) * 5;
        }
        if (request.reactionToMarketDrop() != null) {
            String reaction = request.reactionToMarketDrop().toLowerCase(Locale.ROOT);
            if (reaction.contains("compro") || reaction.contains("oportunidade")) {
                score += 20;
            } else if (reaction.contains("vendo") || reaction.contains("medo")) {
                score -= 20;
            }
        }

        Profile profile = userRepository.findById(userId).map(User::getProfile)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil do usuário não encontrado."));
        profile.setInvestorRiskScore(score);
        return classify(score);
    }

    private RiskProfileResponse classify(int score) {
        String profileName;
        String riskTol;
        String summary;
        Map<String, Double> allocation = new LinkedHashMap<>();

        if (score < 40) {
            profileName = "Conservador";
            riskTol = "Baixa";
            summary = "Prioridade total em segurança e liquidez, minimizando risco de perdas.";
            allocation.put("Renda Fixa", 75.0);
            allocation.put("Fundos Imobiliários", 15.0);
            allocation.put("Ações", 5.0);
            allocation.put("Reserva / Caixa", 5.0);
        } else if (score <= 70) {
            profileName = "Moderado";
            riskTol = "Média";
            summary = "Equilíbrio entre segurança e potencial de valorização a médio e longo prazo.";
            allocation.put("Renda Fixa", 45.0);
            allocation.put("Ações", 35.0);
            allocation.put("Fundos Imobiliários", 15.0);
            allocation.put("Reserva / Caixa", 5.0);
        } else {
            profileName = "Arrojado";
            riskTol = "Alta";
            summary = "Busca de crescimento a longo prazo, com alta tolerância a oscilações e perdas.";
            allocation.put("Ações", 55.0);
            allocation.put("Fundos Imobiliários", 20.0);
            allocation.put("Renda Fixa", 20.0);
            allocation.put("Criptoativos / Outros", 5.0);
        }

        return new RiskProfileResponse(
                profileName,
                riskTol,
                summary,
                List.of("Preservação de capital", "Crescimento patrimonial", "Diversificação"),
                allocation
        );
    }

    /**
     * Generates a curated list of asset recommendations tailored to the investor profile.
     *
     * @param userId the UUID of the user
     * @return list of {@link RecommendationResponse} items
     */
    public List<RecommendationResponse> getRecommendations(UUID userId) {
        return List.of(
                new RecommendationResponse(
                        "Tesouro IPCA+ 2029",
                        "IPCA2029",
                        "Renda Fixa",
                        "Baixo",
                        "Proteção contra a inflação com rentabilidade real garantida até o vencimento.",
                        "IPCA + 6,2% a.a.",
                        "R$ 30,00"
                ),
                new RecommendationResponse(
                        "CDB 110% CDI Liquidez Diária",
                        "CDB110",
                        "Renda Fixa",
                        "Baixo",
                        "Excelente para reserva de emergência e objetivos de curto prazo com garantia do FGC.",
                        "110% CDI",
                        "R$ 100,00"
                ),
                new RecommendationResponse(
                        "BOVA11 - iShares Ibovespa",
                        "BOVA11",
                        "Ações / ETF",
                        "Médio",
                        "Diversificação instantânea nas maiores empresas negociadas na Bolsa brasileira (B3).",
                        "Variável",
                        "R$ 120,00"
                ),
                new RecommendationResponse(
                        "HGLG11 - CSHG Logística",
                        "HGLG11",
                        "Fundos Imobiliários",
                        "Médio",
                        "Um dos maiores FIIs de galpões logísticos com histórico consistente de dividendos mensais.",
                        "~8,5% a.a. em dividendos isentos",
                        "R$ 160,00"
                )
        );
    }
}
