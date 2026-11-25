export function formatarReais(valor: number): string {
    const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
    const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${valor < 0 ? '-' : ''}R$ ${comMilhar},${centavos}`;
}

// Lê um decimal sem símbolos monetários ou separadores de milhar.
export function lerValor(texto: string): number | null {
    const decimal = lerDecimal(texto, 17, 2);
    if (decimal === null) return null;
    const numero = Number(decimal);
    return Number.isFinite(numero) ? numero : null;
}

export function lerDecimal(texto: string, inteiros: number, casas: number): string | null {
    const entrada = texto.trim();
    if (!/^\d+(?:[.,]\d+)?$/.test(entrada)) return null;
    const [parteInteira, fracao = ''] = entrada.replace(',', '.').split('.');
    const inteiro = parteInteira.replace(/^0+(?=\d)/, '');
    const decimais = fracao.replace(/0+$/, '');
    if (inteiro.length > inteiros || decimais.length > casas) return null;
    return decimais ? `${inteiro}.${decimais}` : inteiro;
}

// Valor em reais para preencher um campo de edição ("1234.5" vira "1234,50").
export function valorParaCampo(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
}

// Quantidade (pode ter casas decimais) para preencher um campo de edição.
export function quantidadeParaCampo(quantidade: number): string {
    const texto = String(quantidade);
    const match = /^(\d+)(?:\.(\d+))?e-(\d+)$/.exec(texto);
    if (match) return `0,${'0'.repeat(Number(match[3]) - 1)}${match[1]}${match[2] ?? ''}`;
    return texto.replace('.', ',');
}

export function decimalParaCampo(decimal: string): string {
    const match = /^(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(decimal);
    if (!match) throw new Error('Decimal inválido na resposta do servidor.');
    const digitos = match[1] + (match[2] ?? '');
    const posicao = match[1].length + Number(match[3] ?? 0);
    if (!Number.isSafeInteger(posicao) || Math.abs(posicao) > 1000) throw new Error('Decimal fora do limite.');
    if (posicao <= 0) return `0,${'0'.repeat(-posicao)}${digitos}`;
    if (posicao >= digitos.length) return digitos + '0'.repeat(posicao - digitos.length);
    return `${digitos.slice(0, posicao)},${digitos.slice(posicao)}`;
}

export function compararDecimais(a: string, b: string): number {
    const normalizar = (valor: string) => {
        const [inteiro, fracao = ''] = decimalParaCampo(valor).split(',');
        return [inteiro.replace(/^0+(?=\d)/, ''), fracao.replace(/0+$/, '')];
    };
    const [ai, af] = normalizar(a);
    const [bi, bf] = normalizar(b);
    if (ai.length !== bi.length) return ai.length < bi.length ? -1 : 1;
    if (ai !== bi) return ai < bi ? -1 : 1;
    const tamanho = Math.max(af.length, bf.length);
    const x = af.padEnd(tamanho, '0');
    const y = bf.padEnd(tamanho, '0');
    return x === y ? 0 : x < y ? -1 : 1;
}
