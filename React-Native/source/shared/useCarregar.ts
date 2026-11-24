import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemDeErro } from '../services/api';

// Carrega dados da API sempre que a tela ganha foco (assim a lista se atualiza
// depois de adicionar um item em outra tela).
export function useCarregar<T>(carregar: () => Promise<T>, dependencias: unknown[] = []) {
    const [dados, setDados] = useState<T | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const executar = useCallback(async (ativo: () => boolean = () => true) => {
        setCarregando(true);
        setErro(null);
        try {
            const resultado = await carregar();
            if (ativo()) setDados(resultado);
        } catch (falha) {
            if (ativo()) setErro(mensagemDeErro(falha));
        } finally {
            if (ativo()) setCarregando(false);
        }
    }, dependencias);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;
            void executar(() => ativo);
            return () => {
                ativo = false;
            };
        }, [executar]),
    );

    return { dados, carregando, erro, recarregar: () => executar() };
}
