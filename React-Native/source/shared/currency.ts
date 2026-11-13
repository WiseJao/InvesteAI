export function formatarReais(valor: number): string {
    const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
    const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${valor < 0 ? '-' : ''}R$ ${comMilhar},${centavos}`;
}
