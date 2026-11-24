export function formatarReais(valor: number): string {
    const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
    const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${valor < 0 ? '-' : ''}R$ ${comMilhar},${centavos}`;
}

// Lê um valor digitado pelo usuário ("1.234,56", "R$ 50", "50.5") e devolve o número, ou null se inválido.
export function lerValor(texto: string): number | null {
    const limpo = texto.replace(/[^\d.,]/g, '');
    if (!limpo) return null;

    const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
}

// Valor em reais para preencher um campo de edição ("1234.5" vira "1234,50").
export function valorParaCampo(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
}

// Quantidade (pode ter casas decimais) para preencher um campo de edição.
export function quantidadeParaCampo(quantidade: number): string {
    return String(quantidade).replace('.', ',');
}
