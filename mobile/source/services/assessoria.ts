import { apiRequest } from './api';

export type PerfilInvestidor = {
    perfil: string;
    tolerancia: string;
    resumo: string;
    objetivos: string[];
    alocacao: { nome: string; percentual: number }[];
};

type PerfilApi = {
    profile: string;
    riskTolerance: string;
    summary: string;
    objectives: string[] | null;
    suggestedAllocation: Record<string, number> | null;
};

function converter(perfil: PerfilApi): PerfilInvestidor {
    return {
        perfil: perfil.profile,
        tolerancia: perfil.riskTolerance,
        resumo: perfil.summary,
        objetivos: perfil.objectives ?? [],
        alocacao: Object.entries(perfil.suggestedAllocation ?? {}).map(([nome, percentual]) => ({
            nome,
            percentual: Number(percentual),
        })),
    };
}

export async function obterPerfilInvestidor(): Promise<PerfilInvestidor> {
    return converter(await apiRequest<PerfilApi>('/ai/profile'));
}

export type RespostasQuestionario = {
    respostas: string[];
    anosExperiencia: number;
    reacaoQueda: string;
    horizonte: string;
};

export async function avaliarPerfil(dados: RespostasQuestionario): Promise<PerfilInvestidor> {
    const perfil = await apiRequest<PerfilApi>('/ai/profile/evaluate', {
        method: 'POST',
        body: JSON.stringify({
            answers: dados.respostas,
            investmentExperienceYears: dados.anosExperiencia,
            reactionToMarketDrop: dados.reacaoQueda,
            investmentHorizon: dados.horizonte,
        }),
    });
    return converter(perfil);
}

export type Recomendacao = {
    titulo: string;
    simbolo: string;
    categoria: string;
    risco: string;
    descricao: string;
    retornoEsperado: string;
    aporteMinimo: string;
};

type RecomendacaoApi = {
    title: string;
    symbol: string;
    category: string;
    risk: string;
    description: string;
    expectedReturn: string;
    minInvestment: string;
};

export async function listarRecomendacoes(): Promise<Recomendacao[]> {
    const itens = await apiRequest<RecomendacaoApi[]>('/ai/recommendations');
    return itens.map((item) => ({
        titulo: item.title,
        simbolo: item.symbol,
        categoria: item.category,
        risco: item.risk,
        descricao: item.description,
        retornoEsperado: item.expectedReturn,
        aporteMinimo: item.minInvestment,
    }));
}
