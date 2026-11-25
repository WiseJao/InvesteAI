// Datas no formato da API (AAAA-MM-DD) e no formato exibido ao usuário (DD/MM/AAAA).

export function hojeIso(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function isoParaBr(iso: string): string {
    const [ano, mes, dia] = iso.slice(0, 10).split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

export function isoParaDiaMes(iso: string): string {
    const [, mes, dia] = iso.slice(0, 10).split('-');
    return mes && dia ? `${dia}/${mes}` : iso;
}

// Máscara enquanto digita: 25112026 -> 25/11/2026
export function mascaraData(valor: string): string {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 4) return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    if (numeros.length > 2) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return numeros;
}

// DD/MM/AAAA -> AAAA-MM-DD, ou null se não for uma data real.
export function brParaIso(texto: string): string | null {
    const partes = texto.split('/');
    if (partes.length !== 3) return null;

    const [dia, mes, ano] = partes.map(Number);
    const data = new Date(ano, mes - 1, dia);
    const valida =
        ano >= 1900 &&
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;

    return valida
        ? `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
        : null;
}
