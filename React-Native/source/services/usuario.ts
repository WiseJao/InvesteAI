import { apiRequest, getAuthToken } from './api';

export type Usuario = {
    id: string;
    email: string;
    cpf: string;
    nome: string;
    apelido: string | null;
    ocupacao: string | null;
    renda: number | null;
    rendaExata: string | null;
};

type UsuarioApi = {
    id: string;
    email: string;
    cpf: string;
    profile: {
        name: string;
        nickname: string | null;
        occupation: string | null;
        salary: string | null;
    } | null;
};

let cache: { token: string | null; promessa: Promise<Usuario> } | null = null;

// Dados do usuário logado. O resultado fica guardado enquanto o token for o mesmo,
// então telas diferentes (Header, Perfil) não repetem a chamada.
export function obterUsuario(): Promise<Usuario> {
    const token = getAuthToken();
    if (cache && cache.token === token) return cache.promessa;

    const promessa = apiRequest<UsuarioApi>('/user/me', {}, true).then((usuario) => ({
        id: usuario.id,
        email: usuario.email,
        cpf: usuario.cpf,
        nome: usuario.profile?.name ?? '',
        apelido: usuario.profile?.nickname ?? null,
        ocupacao: usuario.profile?.occupation ?? null,
        rendaExata: usuario.profile?.salary ?? null,
        renda: usuario.profile?.salary != null ? Number(usuario.profile.salary) : null,
    }));

    cache = { token, promessa };
    promessa.catch(() => {
        if (cache?.promessa === promessa) cache = null;
    });
    return promessa;
}

export function limparUsuario() {
    cache = null;
}

export function nomeParaExibir(usuario: Usuario): string {
    const nome = usuario.apelido?.trim() || usuario.nome.trim().split(' ')[0];
    return nome || 'Usuário';
}

export async function atualizarUsuario(changes: { name: string; nickname: string | null; occupation: string | null; salary: string | null }) {
    await apiRequest('/user/me', { method: 'PATCH', body: JSON.stringify(changes) });
    limparUsuario();
}
