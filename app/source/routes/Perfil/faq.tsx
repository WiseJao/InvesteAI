import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AbasParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import { colors, ui } from '../../styles/colors';
import CabecalhoPesquisa from './components/cabecalhoPesquisa';

type Pergunta = {
    pergunta: string;
    resposta: string;
};

type Topico = {
    titulo: string;
    perguntas: Pergunta[];
};

const topicos: Topico[] = [
    {
        titulo: 'Conta e acesso',
        perguntas: [
            {
                pergunta: 'Como recupero minha senha?',
                resposta:
                    'A recuperação de senha está indisponível até existir um canal seguro de verificação.',
            },
            {
                pergunta: 'Como altero meu e-mail?',
                resposta: 'A alteração de e-mail ainda não está disponível.',
            },
        ],
    },
    {
        titulo: 'Investimentos e gastos',
        perguntas: [
            {
                pergunta: 'Como o saldo do mês é calculado?',
                resposta: 'O saldo é o orçamento do mês menos os gastos registrados. Se você lançar uma receita na categoria Salário, ela substitui a renda mensal prevista no perfil naquele mês.',
            },
            {
                pergunta: 'Como o app calcula o valor da carteira?',
                resposta: 'O app estima o valor das posições com as cotações disponíveis e as condições cadastradas para renda fixa. Quando a cotação ou a estimativa está indisponível, o app sinaliza a situação e usa o custo de compra como referência.',
            },
            {
                pergunta: 'Como devo interpretar as sugestões da Assessoria?',
                resposta: 'Considere as sugestões como exemplos para estudar o mercado. Elas têm finalidade educativa e não constituem recomendação financeira personalizada. Antes de decidir, verifique as informações e considere seus objetivos, seu prazo e os riscos que pode assumir.',
            },
        ],
    },
    {
        titulo: 'Ações e mercado financeiro',
        perguntas: [
            {
                pergunta: 'O que é uma ação?',
                resposta: 'Uma ação representa uma parte do capital de uma empresa. Ao comprar ações, você se torna acionista. O valor investido pode subir ou cair conforme a cotação.',
            },
            {
                pergunta: 'O que são bolsa, ticker e cotação?',
                resposta: 'A bolsa é um ambiente de negociação de ativos. O ticker é o código que identifica um ativo na negociação. A cotação é o preço registrado em um determinado momento e pode mudar ao longo do pregão.',
            },
            {
                pergunta: 'Por que o preço de uma ação sobe ou cai?',
                resposta: 'O preço muda conforme as ofertas de compra e venda. Resultados da empresa, notícias, juros e expectativas sobre a economia podem influenciar essas ofertas. A intensidade dessas oscilações é chamada de volatilidade.',
            },
            {
                pergunta: 'O que são dividendos?',
                resposta: 'Dividendos são uma forma de distribuir parte dos lucros da empresa aos acionistas. O histórico de pagamentos ajuda a entender o que já aconteceu. Os próximos pagamentos dependem dos resultados e das decisões da empresa.',
            },
            {
                pergunta: 'O que são o Ibovespa e um ETF?',
                resposta: 'O Ibovespa é um índice que acompanha uma carteira teórica de ações negociadas na B3. Um ETF é um fundo negociado em bolsa. Alguns ETFs buscam acompanhar um índice, e suas cotas podem ganhar ou perder valor.',
            },
            {
                pergunta: 'O que são liquidez e diversificação?',
                resposta: 'Liquidez é a facilidade de negociar um ativo sem causar grande impacto no preço. Diversificar é distribuir os investimentos entre ativos, emissores ou classes diferentes. Isso pode reduzir o risco de concentração, e a carteira ainda pode ter perdas.',
            },
            {
                pergunta: 'Qual é a diferença entre renda fixa e renda variável?',
                resposta: 'Na renda fixa, a forma de calcular a remuneração é definida na aplicação. O resultado pode depender de um índice, como o CDI, e há riscos que variam conforme o produto. Na renda variável, como em ações, o retorno depende do desempenho e dos preços de mercado.',
            },
        ],
    },
];

export default function FAQ() {
    const navigation = useNavigation();
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');
    const [expandidas, setExpandidas] = useState<string[]>([]);

    const busca = normalizarBusca(termo);

    const visiveis = topicos
        .map((topico) => ({
            ...topico,
            perguntas: topico.perguntas.filter(
                (item) =>
                    normalizarBusca(topico.titulo).includes(busca) ||
                    normalizarBusca(item.pergunta).includes(busca) ||
                    normalizarBusca(item.resposta).includes(busca),
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

            {termo.length > 0 && <TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => setTermo('')}><Text style={{ color: colors.primary }}>Limpar busca</Text></TouchableOpacity>}
            <View style={styles.aviso}>
                <Text accessibilityRole="header" style={styles.avisoTitulo}>Informação para apoiar suas decisões</Text>
                <Text style={styles.avisoTexto}>
                    O InvesteAI é uma ferramenta de acompanhamento e educação financeira. As cotações,
                    estimativas e sugestões do app não constituem recomendação de compra, venda ou manutenção
                    de ativos. Podem ocorrer perdas, e rentabilidade passada não garante resultados futuros.
                </Text>
            </View>

            {visiveis.map((topico) => (
                <View key={topico.titulo} style={styles.topico}>
                    <Text accessibilityRole="header" style={styles.topicoTitulo}>{topico.titulo}</Text>
                    {topico.perguntas.map((item) => {
                        const aberta = expandidas.includes(item.pergunta);

                        return (
                            <View key={item.pergunta} style={styles.pergunta}>
                                <TouchableOpacity
                                    style={styles.perguntaTopo}
                                    onPress={() => alternarPergunta(item.pergunta)}
                                    accessibilityRole="button"
                                    accessibilityLabel={item.pergunta}
                                    accessibilityState={{ expanded: aberta }}
                                >
                                    <Text style={styles.perguntaTexto}>{item.pergunta}</Text>
                                    <Ionicons
                                        name={aberta ? 'chevron-up' : 'chevron-down'}
                                        size={16}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                {aberta ? <>
                                    <Text style={styles.resposta}>{item.resposta}</Text>
                                    {['Como o app calcula o valor da carteira?', 'O que são bolsa, ticker e cotação?', 'Qual é a diferença entre renda fixa e renda variável?'].includes(item.pergunta) && (
                                        <TouchableOpacity accessibilityRole="button" style={styles.atalho} onPress={() => navigation.getParent<BottomTabNavigationProp<AbasParamList>>()?.navigate(
                                            'Investimentos', { screen: 'Carteira', params: { abrirCarteira: Date.now() } },
                                        )}><Text style={{ color: colors.primary }}>Abrir Investimentos</Text></TouchableOpacity>
                                    )}
                                </> : null}
                            </View>
                        );
                    })}
                </View>
            ))}
            {visiveis.length === 0 ? <Text style={styles.resposta}>Nenhum resultado encontrado.</Text> : null}
        </Layout>
    );
}

function normalizarBusca(texto: string) {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const styles = StyleSheet.create({
    aviso: {
        backgroundColor: colors.surface,
        borderLeftWidth: 3,
        borderLeftColor: colors.warning,
        borderRadius: 8,
        padding: ui.space.lg,
    },
    avisoTitulo: {
        color: colors.warning,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    avisoTexto: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 19,
    },
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
        minHeight: 44,
    },
    perguntaTexto: {
        flex: 1,
        fontSize: 13,
        color: colors.text,
        paddingRight: 8,
    },
    atalho: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' },
    resposta: {
        fontSize: ui.font.label,
        color: colors.textMuted,
        paddingHorizontal: 12,
        paddingBottom: 12,
        lineHeight: 20,
    },
});
