import { apiRequest } from './api';

export type ModoObjetivo = 'MANUAL' | 'PORTFOLIO';

export type Objetivo = {
    id: string;
    titulo: string;
    categoria: string;
    valorAtual: number;
    valorAlvo: number;
    valorAtualExato: string;
    valorAlvoExato: string;
    progressMode: ModoObjetivo;
    holdingIds: string[];
    valuationStatus: string | null;
    progresso: number; // 0 a 100
    prazo: string | null; // AAAA-MM-DD
};

type ObjetivoApi = {
    id: string;
    name: string;
    category: string | null;
    currentAmount: string | null;
    targetAmount: string;
    progressPercentage: string | null;
    deadline: string | null;
    progressMode?: ModoObjetivo;
    holdingIds?: string[];
    valuationStatus?: string | null;
};

function converter(item: ObjetivoApi): Objetivo {
    const valorAtual = Number(item.currentAmount ?? 0);
    const valorAlvo = Number(item.targetAmount);
    const progresso = item.progressPercentage ?? (valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0);

    return {
        id: item.id,
        titulo: item.name,
        categoria: item.category ?? '',
        valorAtual,
        valorAlvo,
        valorAtualExato: item.currentAmount ?? '0',
        valorAlvoExato: item.targetAmount,
        progresso: Math.max(0, Math.min(100, Number(progresso))),
        prazo: item.deadline,
        progressMode: item.progressMode ?? 'MANUAL',
        holdingIds: item.holdingIds ?? [],
        valuationStatus: item.valuationStatus ?? null,
    };
}

export async function listarObjetivos(): Promise<Objetivo[]> {
    const itens = await apiRequest<ObjetivoApi[]>('/goals', {}, true);
    return itens.map(converter);
}

export type NovoObjetivo = {
    titulo: string;
    categoria: string;
    valorAlvo: string;
    valorAtual: string;
    progressMode: ModoObjetivo;
    holdingIds?: string[];
    prazo: string | null; // AAAA-MM-DD
};

export async function criarObjetivo(novo: NovoObjetivo): Promise<Objetivo> {
    const criado = await apiRequest<ObjetivoApi>('/goals', {
        method: 'POST',
        body: JSON.stringify({
            title: novo.titulo,
            category: novo.categoria,
            targetAmount: novo.valorAlvo,
            progressMode: novo.progressMode,
            holdingIds: novo.holdingIds,
            ...(novo.progressMode === 'MANUAL' ? { currentAmount: novo.valorAtual } : {}),
            ...(novo.prazo ? { deadline: novo.prazo } : {}),
        }),
    }, true);
    return converter(criado);
}

export async function atualizarObjetivo(id: string, dados: NovoObjetivo, inalterados: { alvo: boolean; atual: boolean }): Promise<Objetivo> {
    const atualizado = await apiRequest<ObjetivoApi>(`/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: dados.titulo,
            ...(dados.categoria ? { category: dados.categoria } : {}),
            ...(inalterados.alvo ? {} : { targetAmount: dados.valorAlvo }),
            progressMode: dados.progressMode,
            holdingIds: dados.holdingIds,
            ...(inalterados.atual || dados.progressMode === 'PORTFOLIO' ? {} : { currentAmount: dados.valorAtual }),
            ...(dados.prazo ? { deadline: dados.prazo } : { clearEndDate: true }),
        }),
    }, true);
    return converter(atualizado);
}

export async function excluirObjetivo(id: string): Promise<void> {
    await apiRequest(`/goals/${id}`, { method: 'DELETE' });
}
