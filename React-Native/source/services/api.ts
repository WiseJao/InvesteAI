import { File as NativeFile } from 'expo-file-system';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lerDecimal } from '../shared/currency';

export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

let authToken: string | null = null;
let refreshToken: string | null = null;

const KEY = 'investeai.refresh';
let version = 0;
let storage = Promise.resolve();
const sessionListeners = new Set<() => void>();

export function onSessionEnded(listener: () => void) {
    sessionListeners.add(listener);
    return () => { sessionListeners.delete(listener); };
}

function saveRefresh(token: string | null) {
    if (Platform.OS === 'web') return Promise.resolve();
    const pending = storage.then(() => token ? SecureStore.setItemAsync(KEY, token) : SecureStore.deleteItemAsync(KEY));
    storage = pending.catch(() => {});
    return pending;
}

async function setAuthTokens(tokens: AuthTokens, started = version) {
    if (started !== version) return false;
    if (!tokens.accessToken || !tokens.refreshToken) throw new Error('Sessão inválida.');
    await saveRefresh(tokens.refreshToken);
    if (started !== version) return false;
    authToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    return true;
}

async function clearAuthTokens() {
    version++;
    authToken = null;
    refreshToken = null;
    renovando = null;
    try {
        await saveRefresh(null);
    } finally {
        sessionListeners.forEach(listener => listener());
    }
}

export function getAuthToken() {
    return authToken;
}

export type AuthTokens = { accessToken: string; refreshToken: string };
type Session = 'active' | 'signed-out' | 'retry';
let renovando: Promise<Session> | null = null;

async function renovarTokens(): Promise<Session> {
    if (!refreshToken) return 'signed-out';
    if (renovando) return renovando;
    const started = version;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const pending = (async (): Promise<Session> => {
        try {
            const response = await fetch(API_BASE_URL + '/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                signal: controller.signal,
            });
            if (started !== version) return 'signed-out';
            if ([400, 401, 403].includes(response.status)) {
                await clearAuthTokens();
                return 'signed-out';
            }
            if (!response.ok) return 'retry';
            return await setAuthTokens(await response.json(), started) ? 'active' : 'signed-out';
        } catch {
            return 'retry';
        } finally {
            clearTimeout(timeout);
        }
    })();
    renovando = pending;
    const result = await pending;
    if (renovando === pending) renovando = null;
    return result;
}

export async function restoreSession(): Promise<Session> {
    if (Platform.OS === 'web') return 'signed-out';
    try {
        refreshToken = await SecureStore.getItemAsync(KEY);
        return renovarTokens();
    } catch {
        return 'retry';
    }
}

// Envia a requisição com o token atual; se a API responder 401, renova o token
// e tenta de novo uma única vez (o access token dura só 15 minutos).
async function authFetch(
    url: string,
    init: RequestInit = {},
    renovar = true
): Promise<Response> {
    const enviar = () => {
        const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
        if (authToken && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        return fetch(url, { ...init, headers });
    };

    const started = version;
    const sentToken = authToken;
    let response = await enviar();
    if (response.status === 401 && renovar && started === version
        && ((authToken && authToken !== sentToken) || await renovarTokens() === 'active') && started === version) {
        response = await enviar();
    }
    return response;
}

export async function apiRequest<T = any>(
    path: string,
    options: RequestInit = {},
    decimaisExatos = false,
): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string>),
    };

    // As rotas /auth/* (login, cadastro...) não passam pela renovação de token.
    const response = await authFetch(url, { ...options, headers }, !path.startsWith('/auth/'));

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        const errorText = await response.text();
        try {
            const errorBody = JSON.parse(errorText);
            errorMessage = errorBody.message ?? errorBody.error ?? JSON.stringify(errorBody);
        } catch {
            if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return {} as T;
    }

    if (!decimaisExatos) return response.json();
    const texto = await response.text();
    JSON.parse(texto);
    return JSON.parse(texto.replace(/"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
        (token) => token.startsWith('"') ? token : `"${token}"`));
}

export async function uploadAvatar(uri: string) {
    const image = Platform.OS === 'web'
        ? new File([await (await fetch(uri)).blob()], 'avatar.jpg', { type: 'image/jpeg' })
        : new NativeFile(uri);
    if (!image.size || image.size > 2 * 1024 * 1024) {
        throw new Error('Selecione uma foto válida de até 2 MiB.');
    }

    const form = new FormData();
    // O File nativo fornece os bytes ao codificador multipart do Expo.
    form.append('file', image as Blob);
    await apiRequest('/user/me/avatar', { method: 'POST', body: form });
}

export async function deleteAvatar(): Promise<void> {
    await apiRequest('/user/me/avatar', { method: 'DELETE' });
}

export async function getAvatar(): Promise<string | null> {
    const response = await authFetch(`${API_BASE_URL}/user/me/avatar`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Não foi possível carregar a foto.'));
        reader.readAsDataURL(blob);
    });
}

// Converte o erro de uma chamada em uma frase que pode ser mostrada ao usuário.
export function mensagemDeErro(erro: unknown): string {
    const mensagem = erro instanceof Error ? erro.message : '';

    if (/network|fetch|failed to connect/i.test(mensagem)) {
        return 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    if (mensagem === 'HTTP 401' || mensagem === 'HTTP 403') {
        return 'Sua sessão expirou. Entre novamente.';
    }
    if (mensagem.startsWith('HTTP ')) {
        return `O servidor não conseguiu concluir a operação (${mensagem}).`;
    }
    return mensagem || 'Algo deu errado. Tente novamente.';
}

export async function login(identifier: string, password: string) {
    const result = await apiRequest<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
    });
    await setAuthTokens(result);
    return result;
}

export async function logout() {
    void apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    await clearAuthTokens();
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

    const salaryNumber = data.renda?.trim() ? lerDecimal(data.renda, 17, 2) : null;
    if (data.renda?.trim() && salaryNumber === null) throw new Error('Renda inválida.');

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

    const result = await apiRequest<AuthTokens>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (result.accessToken) {
        await setAuthTokens(result);
    }

    return result;
}
