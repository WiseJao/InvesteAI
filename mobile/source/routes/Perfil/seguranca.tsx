import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import Layout from '../../shared/layout';
import Field from '../../shared/field';
import BotaoPrimario from '../../shared/botaoPrimario';
import { avisarSucesso } from '../../shared/avisoDeSucesso';
import { useConfirmarSaida } from '../../shared/useConfirmarSaida';
import { ApiError, mensagemDeErroDeGravacao } from '../../services/api';
import { alterarSenha } from '../../services/senha';
import { colors, ui } from '../../styles/colors';

export default function Seguranca() {
    const [atual, setAtual] = useState('');
    const [nova, setNova] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<{ atual?: string; nova?: string; confirmacao?: string; geral?: string }>({});
    const emEnvio = useRef(false);
    useConfirmarSaida(Boolean(atual || nova || confirmacao));

    async function salvar() {
        if (emEnvio.current) return;
        if (!atual.trim()) return setErro({ atual: 'Informe sua senha atual.' });
        if (!nova.trim() || nova.length < 8) return setErro({ nova: 'Use pelo menos 8 caracteres.' });
        if (nova !== confirmacao) return setErro({ confirmacao: 'As senhas devem ser iguais.' });
        emEnvio.current = true;
        setSalvando(true);
        setErro({});
        try {
            await alterarSenha(atual, nova);
            setAtual('');
            setNova('');
            setConfirmacao('');
            setMostrar(false);
            avisarSucesso('Senha alterada. Sessões existentes permanecem ativas.');
        } catch (falha) {
            setErro({ geral: falha instanceof ApiError && falha.status === 400
                ? 'Confira a senha atual e use uma nova senha de até 72 bytes.'
                : mensagemDeErroDeGravacao(falha) });
        } finally {
            emEnvio.current = false;
            setSalvando(false);
        }
    }

    return <Layout titulo="Alterar senha" voltar>
        <Field label="Senha atual" erro={erro.atual} autoComplete="current-password" secureTextEntry={!mostrar}
            value={atual} onChangeText={setAtual} editable={!salvando} />
        <Field label="Nova senha" erro={erro.nova} autoComplete="new-password" secureTextEntry={!mostrar}
            value={nova} onChangeText={setNova} editable={!salvando} />
        <Field label="Confirmar nova senha" erro={erro.confirmacao} autoComplete="new-password" secureTextEntry={!mostrar}
            value={confirmacao} onChangeText={setConfirmacao} editable={!salvando} onSubmitEditing={salvar} />
        <Pressable accessibilityRole="button" onPress={() => setMostrar(v => !v)} style={{ minHeight: ui.touch, justifyContent: 'center' }}>
            <Text style={{ color: colors.primary }}>{mostrar ? 'Ocultar senhas' : 'Mostrar senhas'}</Text>
        </Pressable>
        {erro.geral && <Text accessibilityLiveRegion="polite" style={{ color: colors.negative }}>{erro.geral}</Text>}
        <BotaoPrimario titulo="Salvar senha" onPress={salvar} carregando={salvando} />
    </Layout>;
}
