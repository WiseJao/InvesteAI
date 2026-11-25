import { colors } from './colors';

const categorias: Record<string, string> = {
    contas: '#76afff',
    lazer: '#da9bff',
    transporte: '#ffba72',
    necessidades: '#92dcdc',
    saude: '#ff99b6',
    emergencias: '#edd778',
};

function chave(texto: string) {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function corDaConta(id: string) {
    let hash = 2166136261;
    for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    const unsigned = hash >>> 0;
    const hue = (unsigned % 36000) / 100;
    const saturation = 64 + ((unsigned >>> 16) % 19);
    const lightness = 61 + ((unsigned >>> 24) % 16);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function corDaCategoria(categoria: string) {
    const nome = chave(categoria);
    return categorias[nome] ?? (nome ? corDaConta('categoria:' + nome) : colors.textMuted);
}
