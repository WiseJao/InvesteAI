export type Gasto = {
    nome: string;
    detalhe: string;
    valor: number;
};

export type Categoria = {
    nome: string;
    percentual: number;
};

// TODO: substituir pelos dados da API quando o backend estiver pronto
export const orcamentoMensal = 3000;
export const totalGasto = 2100;

export const categorias: Categoria[] = [
    { nome: 'Contas', percentual: 35 },
    { nome: 'Lazer', percentual: 15 },
    { nome: 'Transporte', percentual: 12 },
    { nome: 'Necessidades', percentual: 20 },
    { nome: 'Saúde', percentual: 8 },
    { nome: 'Emergências', percentual: 10 },
];

export const gastosFixos: Gasto[] = [
    { nome: 'Aluguel', detalhe: 'Necessidades · mensal', valor: 1200 },
    { nome: 'Internet', detalhe: 'Contas · mensal', valor: 120 },
    { nome: 'Academia', detalhe: 'Saúde · mensal', valor: 90 },
    { nome: 'Streaming', detalhe: 'Lazer · mensal', valor: 45 },
    { nome: 'Seguro do carro', detalhe: 'Transporte · mensal', valor: 180 },
];

export const gastosVariaveis: Gasto[] = [
    { nome: 'Supermercado', detalhe: 'Necessidades · 15/09', valor: 340 },
    { nome: 'Restaurante', detalhe: 'Lazer · 12/09', valor: 95 },
    { nome: 'Uber', detalhe: 'Transporte · 10/09', valor: 62 },
    { nome: 'Farmácia', detalhe: 'Saúde · 08/09', valor: 78 },
    { nome: 'Cinema', detalhe: 'Lazer · 05/09', valor: 60 },
];

export const historicoGastos: Gasto[] = [
    { nome: 'Supermercado', detalhe: '15/09 · Variável', valor: 340 },
    { nome: 'Restaurante', detalhe: '12/09 · Variável', valor: 95 },
    { nome: 'Aluguel', detalhe: '10/09 · Fixo', valor: 1200 },
    { nome: 'Uber', detalhe: '10/09 · Variável', valor: 62 },
    { nome: 'Internet', detalhe: '05/09 · Fixo', valor: 120 },
    { nome: 'Cinema', detalhe: '05/09 · Variável', valor: 60 },
];
