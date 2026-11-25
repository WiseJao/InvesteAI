import type { Movimentacao, Recorrencia } from '../../services/gastos';

export type GastosStackParamList = {
    Gastos: undefined;
    GastosFixos: undefined;
    GastosVariaveis: undefined;
    HistoricoGastos: { periodo?: string; consulta?: number } | undefined;
    NovoGasto: { gasto?: Movimentacao; regra?: Recorrencia; novoFixo?: boolean | undefined } | undefined;
};
