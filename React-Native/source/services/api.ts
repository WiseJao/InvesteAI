export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

let authToken: string | null = null;
let refreshToken: string | null = null;

export function setAuthTokens(tokens: { accessToken?: string; refreshToken?: string }) {
    if (tokens.accessToken) authToken = tokens.accessToken;
    if (tokens.refreshToken) refreshToken = tokens.refreshToken;
}

export function clearAuthTokens() {
    authToken = null;
    refreshToken = null;
}

export function getAuthToken() {
    return authToken;
}

export async function apiRequest<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (authToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message ?? errorBody.error ?? JSON.stringify(errorBody);
        } catch {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export type UnifiedRegisterData = {
    nome: string;
    sobrenome: string;
    comoOuviu?: string;
    email: string;
    nomeExibicao?: string;
    corFavorita?: string;
    usoPretendido?: string;
    emprego?: string;
    renda?: string;
    datasRecebimento?: string;
    interesseBancos?: string;
    bancosAtuais?: string;
    cpf: string;
    senha: string;
};

export async function registerUnified(data: UnifiedRegisterData) {
    const fullName = `${data.nome.trim()} ${data.sobrenome.trim()}`.trim();
    const cleanCpf = data.cpf.replace(/\D/g, '');

    // Parse salary numeric value
    let salaryNumber: number | null = null;
    if (data.renda) {
        const parsed = parseFloat(data.renda.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(parsed)) {
            salaryNumber = parsed;
        }
    }

    const payload = {
        name: fullName || data.nome,
        email: data.email.trim(),
        password: data.senha,
        cpf: cleanCpf,
        nickname: data.nomeExibicao || null,
        occupation: data.emprego || null,
        salary: salaryNumber,
        salaryDate: null,
        hearAboutUs: data.comoOuviu || null,
        howWantsToUse: data.usoPretendido || null,
        openFinance: data.interesseBancos ? data.interesseBancos.toLowerCase().includes('sim') : false,
        currentBanks: data.bancosAtuais || null,
        favoriteColor: data.corFavorita || null,
    };

    const result = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (result.accessToken) {
        setAuthTokens(result);
    }

    return result;
}
