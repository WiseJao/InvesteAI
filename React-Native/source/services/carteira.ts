import { apiRequest } from './api';

export type TipoInvestimento = 'FIXED_INCOME' | 'VARIABLE_INCOME' | 'LEGACY';
export type ResultadoBusca = { simbolo: string; nome: string };

export type PrecoReferencia = { tradingDate: string; price: string; raw: boolean };

export function obterPrecoReferencia(simbolo: string, data: string): Promise<PrecoReferencia> {
    return apiRequest(`/investments/reference-price?symbol=${encodeURIComponent(simbolo)}&date=${encodeURIComponent(data)}`);
}

export async function buscarAtivos(query: string): Promise<ResultadoBusca[]> {
    const resposta = await apiRequest<{ results: unknown[] }>(`/investments/market/search?q=${encodeURIComponent(query)}`);
    if (!Array.isArray(resposta.results)) throw new Error('Resposta de busca inválida.');
    return resposta.results.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const registro = item as Record<string, unknown>;
        const simbolo = registro.stock ?? registro.symbol;
        const nome = registro.name ?? registro.shortName;
        if (typeof simbolo !== 'string' || !simbolo.trim()) return [];
        return [{ simbolo: simbolo.trim(), nome: typeof nome === 'string' && nome.trim() ? nome : simbolo }];
    }).slice(0, 20);
}

export type Ativo = {
    id: string;
    simbolo: string;
    nome: string;
    quantidade: number;
    quantidadeOriginal: number;
    precoCompra: number;
    quantidadeExata: string;
    quantidadeOriginalExata: string;
    precoCompraExato: string;
    annualRateExata: string | null;
    precoAtual: number;
    investido: number;
    valorAtual: number;
    lucro: number;
    lucroPercentual: number;
    dataCompra: string | null; // AAAA-MM-DD
    investmentType: TipoInvestimento;
    annualRate: number | null;
    priceStatus: string | null;
    quotedAt?: string | null;
};

export type Carteira = {
    totalInvestido: number;
    valorAtual: number;
    lucro: number;
    lucroPercentual: number;
    ativos: Ativo[];
};

type AtivoApi = {
    id: string;
    symbol: string;
    name: string | null;
    originalQuantity?: string | null;
    remainingQuantity: string;
    purchaseUnitPrice: string;
    currentPrice: string | null;
    totalInvested: string;
    currentTotalValue: string;
    profit: string | null;
    profitPercentage: string | null;
    purchaseDate?: string | null;
    investmentType?: TipoInvestimento | null;
    annualRate?: string | null;
    priceStatus?: string | null;
    quotedAt?: string | null;
};

type CarteiraApi = {
    totalInvested: string | null;
    currentTotalValue: string | null;
    totalProfit: string | null;
    profitPercentage: string | null;
    holdings: AtivoApi[] | null;
};

export async function obterCarteira(): Promise<Carteira> {
    const carteira = await apiRequest<CarteiraApi>('/portfolio', {}, true);
    return {
        totalInvestido: Number(carteira.totalInvested ?? 0),
        valorAtual: Number(carteira.currentTotalValue ?? 0),
        lucro: Number(carteira.totalProfit ?? 0),
        lucroPercentual: Number(carteira.profitPercentage ?? 0),
        ativos: (carteira.holdings ?? []).map((ativo) => ({
            id: ativo.id,
            simbolo: ativo.symbol,
            nome: ativo.name ?? ativo.symbol,
            quantidade: Number(ativo.remainingQuantity),
            quantidadeOriginal: Number(ativo.originalQuantity ?? ativo.remainingQuantity),
            precoCompra: Number(ativo.purchaseUnitPrice),
            quantidadeExata: ativo.remainingQuantity,
            quantidadeOriginalExata: ativo.originalQuantity ?? ativo.remainingQuantity,
            precoCompraExato: ativo.purchaseUnitPrice,
            annualRateExata: ativo.annualRate ?? null,
            precoAtual: Number(ativo.currentPrice ?? ativo.purchaseUnitPrice),
            investido: Number(ativo.totalInvested),
            valorAtual: Number(ativo.currentTotalValue),
            lucro: Number(ativo.profit ?? 0),
            lucroPercentual: Number(ativo.profitPercentage ?? 0),
            dataCompra: ativo.purchaseDate ?? null,
            investmentType: ativo.investmentType ?? 'LEGACY',
            annualRate: ativo.annualRate == null ? null : Number(ativo.annualRate),
            priceStatus: ativo.priceStatus ?? null,
            quotedAt: ativo.quotedAt ?? null,
        })),
    };
}

export type NovoAtivo = {
    simbolo: string;
    nome: string;
    quantidade: string;
    precoCompra: string;
    data: string | null; // AAAA-MM-DD
    investmentType: TipoInvestimento;
    annualRate: string | null;
};

export async function adicionarAtivo(novo: NovoAtivo): Promise<void> {
    await apiRequest('/portfolio/holdings', {
        method: 'POST',
        body: JSON.stringify({
            symbol: novo.simbolo.toUpperCase(),
            name: novo.nome,
            quantity: novo.quantidade,
            purchaseUnitPrice: novo.precoCompra,
            purchaseDate: novo.data,
            investmentType: novo.investmentType,
            annualRate: novo.annualRate,
        }),
    });
}

export async function atualizarAtivo(id: string, dados: NovoAtivo, inalterados: { quantidade: boolean; precoCompra: boolean; annualRate: boolean }): Promise<void> {
    await apiRequest(`/portfolio/holdings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            symbol: dados.simbolo.toUpperCase(),
            name: dados.nome,
            ...(inalterados.quantidade ? {} : { quantity: dados.quantidade }),
            ...(inalterados.precoCompra ? {} : { purchaseUnitPrice: dados.precoCompra }),
            purchaseDate: dados.data,
            investmentType: dados.investmentType,
            ...(inalterados.annualRate ? {} : { annualRate: dados.annualRate }),
        }),
    });
}

export async function excluirAtivo(id: string): Promise<void> {
    await apiRequest(`/portfolio/holdings/${id}`, { method: 'DELETE' });
}
