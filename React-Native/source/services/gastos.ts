import { apiRequest } from './api';

export type TipoMovimentacao = 'EXPENSE_FIXED' | 'EXPENSE_VARIABLE' | 'INCOME';

export type Movimentacao = {
    id: string;
    nome: string;
    categoria: string;
    valor: number;
    data: string; // AAAA-MM-DD
    entrada: boolean;
    classificacao: 'FIXED' | 'VARIABLE' | null;
};

type MovimentacaoApi = {
    id: string;
    flowDate: string;
    amount: number;
    direction: 'IN' | 'OUT';
    description: string | null;
    category: string | null;
    classification: 'FIXED' | 'VARIABLE' | null;
};

export type CategoriaGasto = {
    nome: string;
    gasto: number;
    percentual: number;
};

export type ResumoGastos = {
    orcamentoMensal: number;
    totalGasto: number;
    totalReceitas: number;
    saldo: number;
    categorias: CategoriaGasto[];
};

type ResumoApi = {
    monthlyBudget: number | null;
    totalSpent: number | null;
    totalIncome: number | null;
    remainingBudget: number | null;
    categories: { name: string; spent: number; percentage: number }[] | null;
};

function converter(item: MovimentacaoApi): Movimentacao {
    return {
        id: item.id,
        nome: item.description?.trim() || 'Sem descrição',
        categoria: item.category?.trim() || 'Sem categoria',
        valor: Number(item.amount),
        data: item.flowDate,
        entrada: item.direction === 'IN',
        classificacao: item.classification,
    };
}

// Todas as movimentações do usuário (mais recentes primeiro), opcionalmente só gastos fixos ou variáveis.
export async function listarMovimentacoes(tipo?: 'EXPENSE_FIXED' | 'EXPENSE_VARIABLE'): Promise<Movimentacao[]> {
    const consulta = tipo ? `?type=${tipo}` : '';
    const itens = await apiRequest<MovimentacaoApi[]>(`/cashflow${consulta}`);
    return itens
        .map(converter)
        .sort((a, b) => b.data.localeCompare(a.data));
}

export async function obterResumoGastos(): Promise<ResumoGastos> {
    const resumo = await apiRequest<ResumoApi>('/cashflow/summary');
    return {
        orcamentoMensal: Number(resumo.monthlyBudget ?? 0),
        totalGasto: Number(resumo.totalSpent ?? 0),
        totalReceitas: Number(resumo.totalIncome ?? 0),
        saldo: Number(resumo.remainingBudget ?? 0),
        categorias: (resumo.categories ?? []).map((categoria) => ({
            nome: categoria.name,
            gasto: Number(categoria.spent),
            percentual: Number(categoria.percentage),
        })),
    };
}

export type NovaMovimentacao = {
    nome: string;
    valor: number;
    tipo: TipoMovimentacao;
    categoria: string;
    data: string; // AAAA-MM-DD
};

export async function criarMovimentacao(nova: NovaMovimentacao): Promise<Movimentacao> {
    const criada = await apiRequest<MovimentacaoApi>('/cashflow', {
        method: 'POST',
        body: JSON.stringify({
            name: nova.nome,
            amount: nova.valor,
            type: nova.tipo,
            category: nova.categoria,
            date: nova.data,
        }),
    });
    return converter(criada);
}

function corpoDaMovimentacao(dados: NovaMovimentacao) {
    return {
        description: dados.nome,
        amount: dados.valor,
        type: dados.tipo,
        // O backend só troca receita por gasto (e vice-versa) quando a direção vem explícita.
        direction: dados.tipo === 'INCOME' ? 'IN' : 'OUT',
        // Sem isto, um gasto fixo que vira receita manteria a classificação antiga (FIXED).
        classification: dados.tipo === 'EXPENSE_FIXED' ? 'FIXED' : 'VARIABLE',
        category: dados.categoria,
        date: dados.data,
    };
}

export async function atualizarMovimentacao(id: string, dados: NovaMovimentacao): Promise<Movimentacao> {
    const atualizada = await apiRequest<MovimentacaoApi>(`/cashflow/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(corpoDaMovimentacao(dados)),
    });
    return converter(atualizada);
}

export async function excluirMovimentacao(id: string): Promise<void> {
    await apiRequest(`/cashflow/${id}`, { method: 'DELETE' });
}

export function tipoDaMovimentacao(item: Movimentacao): TipoMovimentacao {
    if (item.entrada) return 'INCOME';
    return item.classificacao === 'FIXED' ? 'EXPENSE_FIXED' : 'EXPENSE_VARIABLE';
}
