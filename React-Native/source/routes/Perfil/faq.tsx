import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import { colors } from '../../styles/colors';
import CabecalhoPesquisa from './components/cabecalhoPesquisa';

type Pergunta = {
    pergunta: string;
    resposta: string;
};

type Topico = {
    titulo: string;
    perguntas: Pergunta[];
};

// TODO: textos provisórios, o grupo precisa revisar o conteúdo
const topicos: Topico[] = [
    {
        titulo: 'Conta e acesso',
        perguntas: [
            {
                pergunta: 'Como recupero minha senha?',
                resposta:
                    'Na tela de login, toque em "Esqueci minha senha" e informe o CPF ou e-mail cadastrado.',
            },
            {
                pergunta: 'Como altero meu e-mail?',
                resposta: 'Acesse Perfil > Central de segurança > Alterar email.',
            },
        ],
    },
    {
        titulo: 'Investimentos e gastos',
        perguntas: [
            {
                pergunta: 'Como o saldo geral é calculado?',
                resposta: 'Resposta provisória: soma dos investimentos cadastrados no aplicativo.',
            },
            {
                pergunta: 'De onde vêm as recomendações?',
                resposta: 'Resposta provisória: são geradas a partir do seu perfil de investidor.',
            },
        ],
    },
];

export default function FAQ() {
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');
    const [expandidas, setExpandidas] = useState<string[]>([]);

    const busca = termo.trim().toLowerCase();

    const visiveis = topicos
        .map((topico) => ({
            ...topico,
            perguntas: topico.perguntas.filter(
                (item) =>
                    item.pergunta.toLowerCase().includes(busca) ||
                    item.resposta.toLowerCase().includes(busca),
            ),
        }))
        .filter((topico) => topico.perguntas.length > 0);

    function alternarPesquisa() {
        setAberto((atual) => !atual);
        setTermo('');
    }

    function alternarPergunta(pergunta: string) {
        setExpandidas((atual) =>
            atual.includes(pergunta) ? atual.filter((p) => p !== pergunta) : [...atual, pergunta],
        );
    }

    return (
        <Layout comHeader={false} voltar>
            <CabecalhoPesquisa
                titulo="FAQ"
                aberto={aberto}
                termo={termo}
                onAlternar={alternarPesquisa}
                onChangeTermo={setTermo}
            />

            {visiveis.map((topico) => (
                <View key={topico.titulo} style={styles.topico}>
                    <Text style={styles.topicoTitulo}>{topico.titulo}</Text>
                    {topico.perguntas.map((item) => {
                        const aberta = expandidas.includes(item.pergunta);

                        return (
                            <View key={item.pergunta} style={styles.pergunta}>
                                <TouchableOpacity
                                    style={styles.perguntaTopo}
                                    onPress={() => alternarPergunta(item.pergunta)}
                                >
                                    <Text style={styles.perguntaTexto}>{item.pergunta}</Text>
                                    <Ionicons
                                        name={aberta ? 'chevron-up' : 'chevron-down'}
                                        size={16}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                {aberta ? <Text style={styles.resposta}>{item.resposta}</Text> : null}
                            </View>
                        );
                    })}
                </View>
            ))}
        </Layout>
    );
}

const styles = StyleSheet.create({
    topico: {
        marginBottom: 16,
    },
    topicoTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    pergunta: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 8,
    },
    perguntaTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    perguntaTexto: {
        flex: 1,
        fontSize: 13,
        color: colors.text,
        paddingRight: 8,
    },
    resposta: {
        fontSize: 12,
        color: colors.textMuted,
        paddingHorizontal: 12,
        paddingBottom: 12,
        lineHeight: 18,
    },
});
