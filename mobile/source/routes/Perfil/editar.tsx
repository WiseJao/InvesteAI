import { avisarSucesso } from '../../shared/avisoDeSucesso';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useConfirmarSaida } from '../../shared/useConfirmarSaida';
import Layout from '../../shared/layout';
import Field from '../../shared/field';
import Estado from '../../shared/estado';
import BotaoPrimario from '../../shared/botaoPrimario';
import { useCarregar } from '../../shared/useCarregar';
import { decimalParaCampo, lerDecimal } from '../../shared/currency';
import { atualizarUsuario, obterUsuario, type Usuario } from '../../services/usuario';
import { mensagemDeErroDeGravacao } from '../../services/api';
import { usePrivacidade } from '../../shared/privacidade';
import { colors } from '../../styles/colors';

function Form({ usuario }: { usuario: Usuario }) {
    const navigation = useNavigation();
    const [name, setName] = useState(usuario.nome);
    const [nickname, setNickname] = useState(usuario.apelido ?? '');
    const [occupation, setOccupation] = useState(usuario.ocupacao ?? '');
    const [income, setIncome] = useState(usuario.rendaExata === null ? '' : decimalParaCampo(usuario.rendaExata));
    const [concluido, setConcluido] = useState(false);
    const ocupado = useRef(false);
    const assinatura = JSON.stringify([name, nickname, occupation, income]);
    const inicial = useRef(assinatura);
    useConfirmarSaida(!concluido && assinatura !== inicial.current);
    useEffect(() => { if (concluido) navigation.goBack(); }, [concluido, navigation]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        if (ocupado.current) return;
        const salary = income.trim() ? lerDecimal(income, 17, 2) : null;
        if (!name.trim()) return setError('Informe seu nome.');
        if (income.trim() && salary === null) return setError('Informe uma renda mensal válida.');
        ocupado.current = true;
        setSaving(true);
        setError(null);
        try {
            await atualizarUsuario({ name: name.trim(), nickname: nickname.trim() || null, occupation: occupation.trim() || null, salary });
            avisarSucesso('Perfil atualizado.');
            setConcluido(true);
        } catch (failure) {
            setError(mensagemDeErroDeGravacao(failure));
        } finally {
            ocupado.current = false;
            setSaving(false);
        }
    }

    return <>
        <Field label="Nome" value={name} onChangeText={setName} maxLength={255} />
        <Field label="Apelido" value={nickname} onChangeText={setNickname} maxLength={255} />
        <Field label="Ocupação" value={occupation} onChangeText={setOccupation} maxLength={255} />
        <Field label="Renda mensal prevista (R$)" financeiro keyboardType="decimal-pad" value={income} onChangeText={setIncome} />
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Deixe a renda em branco para remover a previsão do orçamento.</Text>
        {error && <Text style={{ color: colors.negative }} accessibilityLiveRegion="polite">{error}</Text>}
        <BotaoPrimario titulo="Salvar perfil" onPress={save} carregando={saving} />
    </>;
}

export default function EditarPerfil() {
    const { oculto } = usePrivacidade();
    const { dados, erro, carregando, recarregar } = useCarregar(obterUsuario);
    return <Layout titulo="Editar perfil" voltar>
        {oculto ? <Text style={{ color: colors.text }}>Perfil oculto. Use o botão de privacidade para exibi-lo.</Text> : <Estado temDados={dados !== null} erro={erro} carregando={carregando} onTentarNovamente={recarregar}>
            {dados && <Form usuario={dados} />}
        </Estado>}
    </Layout>;
}
