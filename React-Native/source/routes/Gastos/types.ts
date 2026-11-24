import type { Movimentacao } from '../../services/gastos';

export type GastosStackParamList = {
    Gastos: undefined;
    GastosFixos: undefined;
    GastosVariaveis: undefined;
    HistoricoGastos: undefined;
    NovoGasto: { gasto?: Movimentacao } | undefined;
};
