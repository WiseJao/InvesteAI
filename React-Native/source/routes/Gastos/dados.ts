import { isoParaDiaMes } from '../../shared/datas';
import type { Movimentacao } from '../../services/gastos';

export type Gasto = {
    id: string;
    nome: string;
    detalhe: string;
    valor: number;
    entrada?: boolean;
};

export const categoriasDeGasto = [
    'Contas',
    'Lazer',
    'Transporte',
    'Necessidades',
    'Saúde',
    'Emergências',
] as const;

// Linha usada nas listas de gastos fixos e variáveis: "Categoria · dd/mm".
export function paraLinhaPorCategoria(item: Movimentacao): Gasto {
    return {
        id: item.id,
        nome: item.nome,
        detalhe: `${item.categoria} · ${isoParaDiaMes(item.data)}`,
        valor: item.valor,
        entrada: item.entrada,
    };
}

// Linha usada no histórico: "dd/mm · Fixo|Variável|Receita".
export function paraLinhaDeHistorico(item: Movimentacao): Gasto {
    const tipo = item.entrada ? 'Receita' : item.classificacao === 'FIXED' ? 'Fixo' : 'Variável';
    return {
        id: item.id,
        nome: item.nome,
        detalhe: `${isoParaDiaMes(item.data)} · ${tipo}`,
        valor: item.valor,
        entrada: item.entrada,
    };
}
