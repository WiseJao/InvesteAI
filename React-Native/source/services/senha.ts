import { apiRequest } from './api';

type RespostaCodigo = {
    message: string;
    code?: string | null;
};

// Aceita e-mail ou CPF (com ou sem pontuação); CPF vai só com os dígitos.
export function normalizarIdentificador(texto: string): string {
    const limpo = texto.trim();
    if (limpo.includes('@')) return limpo.toLowerCase();
    return limpo.replace(/\D/g, '');
}

// Pede o código de recuperação. A API devolve o código na resposta (não há envio real de e-mail).
export async function solicitarCodigo(identificador: string): Promise<string | null> {
    const resposta = await apiRequest<RespostaCodigo>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: normalizarIdentificador(identificador) }),
    });
    return resposta.code ?? null;
}

export async function redefinirSenha(identificador: string, codigo: string, novaSenha: string): Promise<void> {
    await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
            identifier: normalizarIdentificador(identificador),
            code: codigo.trim(),
            newPassword: novaSenha,
        }),
    });
}
