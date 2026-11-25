import { apiRequest } from './api';

export type TipoMovimentacao = 'EXPENSE_FIXED' | 'EXPENSE_VARIABLE' | 'INCOME';

export type Movimentacao = {
    id: string;
    nome: string;
    categoria: string;
    valor: number;
    valorExato: string;
    data: string; // AAAA-MM-DD
    entrada: boolean;
    classificacao: 'FIXED' | 'VARIABLE' | null;
};

type MovimentacaoApi = {
    id: string;
    flowDate: string;
    amount: string;
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
        valorExato: item.amount,
        data: item.flowDate,
        entrada: item.direction === 'IN',
        classificacao: item.classification,
    };
}

// Todas as movimentações do usuário (mais recentes primeiro), opcionalmente só gastos fixos ou variáveis.
export async function listarMovimentacoes(tipo?: 'EXPENSE_FIXED' | 'EXPENSE_VARIABLE'): Promise<Movimentacao[]> {
    const consulta = tipo ? `?type=${tipo}` : '';
    const itens = await apiRequest<MovimentacaoApi[]>(`/cashflow${consulta}`, {}, true);
    return itens
        .map(converter)
        .sort((a, b) => b.data.localeCompare(a.data));
}

export async function obterResumoGastos(periodo?: { mes: number; ano: number }): Promise<ResumoGastos> {
    const consulta = periodo ? `?month=${periodo.mes}&year=${periodo.ano}` : '';
    const resumo = await apiRequest<ResumoApi>(`/cashflow/summary${consulta}`);
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
    valor: string;
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
    }, true);
    return converter(criada);
}

function corpoDaMovimentacao(dados: NovaMovimentacao, valorInalterado: boolean) {
    return {
        description: dados.nome,
        ...(valorInalterado ? {} : { amount: dados.valor }),
        type: dados.tipo,
        // O backend só troca receita por gasto (e vice-versa) quando a direção vem explícita.
        direction: dados.tipo === 'INCOME' ? 'IN' : 'OUT',
        // Sem isto, um gasto fixo que vira receita manteria a classificação antiga (FIXED).
        classification: dados.tipo === 'EXPENSE_FIXED' ? 'FIXED' : 'VARIABLE',
        category: dados.categoria,
        date: dados.data,
    };
}

export async function atualizarMovimentacao(id: string, dados: NovaMovimentacao, valorInalterado = false): Promise<Movimentacao> {
    const atualizada = await apiRequest<MovimentacaoApi>(`/cashflow/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(corpoDaMovimentacao(dados, valorInalterado)),
    }, true);
    return converter(atualizada);
}

export async function excluirMovimentacao(id: string): Promise<void> {
    await apiRequest(`/cashflow/${id}`, { method: 'DELETE' });
}

export function tipoDaMovimentacao(item: Movimentacao): TipoMovimentacao {
    if (item.entrada) return 'INCOME';
    return item.classificacao === 'FIXED' ? 'EXPENSE_FIXED' : 'EXPENSE_VARIABLE';
}

export type Recorrencia = {
    id: string;
    description: string;
    category: string;
    amount: string;
    firstDate: string;
    lastDate: string | null;
    ended: boolean;
};

export function listarRecorrencias() {
    return apiRequest<Recorrencia[]>('/cashflow/recurrences', {}, true);
}

export function salvarRecorrencia(data: Omit<Recorrencia, 'id' | 'ended'> & { existingCashFlowId?: string }, id?: string) {
    return apiRequest<Recorrencia>(id ? '/cashflow/recurrences/' + id : '/cashflow/recurrences', {
        method: id ? 'PUT' : 'POST', body: JSON.stringify(data),
    }, true);
}

export function encerrarRecorrencia(id: string) {
    return apiRequest('/cashflow/recurrences/' + id, { method: 'DELETE' });
}
