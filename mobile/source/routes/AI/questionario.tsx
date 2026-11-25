import { useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import { mensagemDeErro } from '../../services/api';
import { avaliarPerfil } from '../../services/assessoria';
import { colors } from '../../styles/colors';
import type { AIStackParamList } from './types';

const objetivos = [
    { valor: 'Preservar o que já tenho', texto: 'Preservar patrimônio' },
    { valor: 'Crescer o patrimônio com equilíbrio', texto: 'Crescer com equilíbrio' },
    { valor: 'Maximizar o retorno no longo prazo', texto: 'Maximizar retorno' },
] as const;

const oscilacoes = [
    { valor: 'Não aceito oscilações', texto: 'Não aceito' },
    { valor: 'Aceito oscilações moderadas de curto prazo', texto: 'Moderadas' },
    { valor: 'Aceito grandes oscilações em busca de maiores retornos', texto: 'Grandes' },
] as const;

// O backend entende "vendo/medo" e "compro/oportunidade" na reação à queda do mercado.
const reacoes = [
    { valor: 'Vendo tudo com medo de perder mais', texto: 'Vendo tudo' },
    { valor: 'Mantenho a posição e aguardo', texto: 'Mantenho' },
    { valor: 'Compro mais, vejo como oportunidade', texto: 'Compro mais' },
] as const;

const experiencias = [
    { valor: '0', texto: 'Nenhuma' },
    { valor: '1', texto: 'Até 1 ano' },
    { valor: '3', texto: '2 a 4 anos' },
    { valor: '6', texto: '5 anos ou mais' },
] as const;

const horizontes = [
    { valor: 'Até 2 anos', texto: 'Até 2 anos' },
    { valor: '2 a 5 anos', texto: '2 a 5 anos' },
    { valor: '5 a 10 anos', texto: '5 a 10 anos' },
    { valor: 'Mais de 10 anos', texto: '+10 anos' },
] as const;

export default function Questionario() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
    const [objetivo, setObjetivo] = useState<string>(objetivos[1].valor);
    const [oscilacao, setOscilacao] = useState<string>(oscilacoes[1].valor);
    const [reacao, setReacao] = useState<string>('');
    const [experiencia, setExperiencia] = useState<string>('');
    const ocupado = useRef(false);
    const [horizonte, setHorizonte] = useState<string>(horizontes[1].valor);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function enviar() {
        if (ocupado.current) return;
        if (!reacao || !experiencia) return setErro('Selecione sua experiência e como reage a uma queda.');
        ocupado.current = true;
        setEnviando(true);
        setErro(null);
        try {
            await avaliarPerfil({
                respostas: [objetivo, oscilacao],
                anosExperiencia: Number(experiencia),
                reacaoQueda: reacao,
                horizonte,
            });
            navigation.replace('PerfilInvestidor');
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            ocupado.current = false;
            setEnviando(false);
        }
    }

    return (
        <Layout titulo="Análise de perfil" subtitulo="A classificação atual considera experiência e reação a quedas." voltar>
            <Card>
                <Opcoes rotulo="1. Qual é o seu principal objetivo? (contexto)" opcoes={objetivos} selecionado={objetivo} onSelecionar={setObjetivo} />
                <Opcoes rotulo="2. Quanto você aceita ver seu dinheiro oscilar? (contexto)" opcoes={oscilacoes} selecionado={oscilacao} onSelecionar={setOscilacao} />
                <Opcoes rotulo="3. Se o mercado cair forte, o que você faz?" opcoes={reacoes} selecionado={reacao} onSelecionar={setReacao} />
                <Opcoes rotulo="4. Há quanto tempo você investe?" opcoes={experiencias} selecionado={experiencia} onSelecionar={setExperiencia} />
                <Opcoes rotulo="5. Por quanto tempo pretende manter o investimento? (contexto)" opcoes={horizontes} selecionado={horizonte} onSelecionar={setHorizonte} />
            </Card>

            {erro ? <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text> : null}
            <BotaoPrimario titulo="Ver meu perfil" onPress={enviar} carregando={enviando} />
        </Layout>
    );
}

const styles = StyleSheet.create({
    erro: {
        fontSize: 12,
        color: colors.negative,
        marginBottom: 12,
    },
});
