import { apiRequest } from './api';

export type Ativo = {
    id: string;
    simbolo: string;
    nome: string;
    quantidade: number;
    precoCompra: number;
    precoAtual: number;
    investido: number;
    valorAtual: number;
    lucro: number;
    lucroPercentual: number;
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
    remainingQuantity: number;
    purchaseUnitPrice: number;
    currentPrice: number | null;
    totalInvested: number;
    currentTotalValue: number;
    profit: number | null;
    profitPercentage: number | null;
};

type CarteiraApi = {
    totalInvested: number | null;
    currentTotalValue: number | null;
    totalProfit: number | null;
    profitPercentage: number | null;
    holdings: AtivoApi[] | null;
};

export async function obterCarteira(): Promise<Carteira> {
    const carteira = await apiRequest<CarteiraApi>('/portfolio');
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
            precoCompra: Number(ativo.purchaseUnitPrice),
            precoAtual: Number(ativo.currentPrice ?? ativo.purchaseUnitPrice),
            investido: Number(ativo.totalInvested),
            valorAtual: Number(ativo.currentTotalValue),
            lucro: Number(ativo.profit ?? 0),
            lucroPercentual: Number(ativo.profitPercentage ?? 0),
        })),
    };
}

export type NovoAtivo = {
    simbolo: string;
    nome: string;
    quantidade: number;
    precoCompra: number;
    data: string; // AAAA-MM-DD
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
        }),
    });
}
