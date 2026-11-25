import { apiRequest } from './api';

export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await apiRequest('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: senhaAtual, newPassword: novaSenha }),
    });
}
