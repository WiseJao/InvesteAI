import { apiRequest } from './api';

export type Objetivo = {
    id: string;
    titulo: string;
    categoria: string;
    valorAtual: number;
    valorAlvo: number;
    progresso: number; // 0 a 100
    prazo: string | null; // AAAA-MM-DD
};

type ObjetivoApi = {
    id: string;
    name: string;
    category: string | null;
    currentAmount: number | null;
    targetAmount: number;
    progressPercentage: number | null;
    deadline: string | null;
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
        progresso: Math.max(0, Math.min(100, Number(progresso))),
        prazo: item.deadline,
    };
}

export async function listarObjetivos(): Promise<Objetivo[]> {
    const itens = await apiRequest<ObjetivoApi[]>('/goals');
    return itens.map(converter);
}

export type NovoObjetivo = {
    titulo: string;
    categoria: string;
    valorAlvo: number;
    valorAtual: number;
    prazo: string | null; // AAAA-MM-DD
};

export async function criarObjetivo(novo: NovoObjetivo): Promise<Objetivo> {
    const criado = await apiRequest<ObjetivoApi>('/goals', {
        method: 'POST',
        body: JSON.stringify({
            title: novo.titulo,
            category: novo.categoria,
            targetAmount: novo.valorAlvo,
            currentAmount: novo.valorAtual,
            ...(novo.prazo ? { deadline: novo.prazo } : {}),
        }),
    });
    return converter(criado);
}
