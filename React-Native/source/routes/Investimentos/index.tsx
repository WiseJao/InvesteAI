import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
    StyleSheet,
} from 'react-native';
import CardAtivo from './components/CardAtivo';
import Botao from './components/Botao';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../shared/header';
import { colors } from '../../styles/colors';
type Cotacao = {
    symbol: string;
    data: {
        shortName?: string;
        regularMarketPrice?: number;
        regularMarketChangePercent?: number;
        logourl?: string;
    };
};

type RespostaCotacoes = {
    results?: Cotacao[];
};

const API_URL = (
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');
const TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'NVDC34'];

function formatarPreco(preco?: number) {
    if (typeof preco !== 'number' || !Number.isFinite(preco)) {
        return 'Indisponível';
    }

    return preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatarVariacao(variacao?: number) {
    if (typeof variacao !== 'number' || !Number.isFinite(variacao)) {
        return '—';
    }

    return `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%`;
}

export default function Investimentos() {
    const [ativos, setAtivos] = useState<Cotacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarCotacoes = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const resposta = await fetch(
                `${API_URL}/investments/quotes?symbols=${TICKERS.join(',')}`,
                { headers: { Accept: 'application/json' } },
            );

            if (!resposta.ok) {
                let mensagem = `A API respondeu com status ${resposta.status}.`;

                try {
                    const corpo: unknown = await resposta.json();
                    if (typeof corpo === 'object' && corpo !== null) {
                        if ('message' in corpo && typeof corpo.message === 'string') {
                            mensagem = corpo.message;
                        } else if ('detail' in corpo && typeof corpo.detail === 'string') {
                            mensagem = corpo.detail;
                        }
                    }
                } catch {
                    // Usa a mensagem com status quando a resposta não contém JSON.
                }

                throw new Error(mensagem);
            }

            const dados: RespostaCotacoes = await resposta.json();
            if (!Array.isArray(dados.results)) {
                throw new Error('A resposta da API não contém a lista de cotações esperada.');
            }

            setAtivos(dados.results);
        } catch (erroRequest) {
            setErro(
                erroRequest instanceof Error
                    ? erroRequest.message
                    : `Não foi possível conectar à API em ${API_URL}.`,
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarCotacoes();
    }, [carregarCotacoes]);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.background }}
            edges={['top']}
        >
            <Header name="Usuario" />

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={carregando}
                        onRefresh={carregarCotacoes}
                        tintColor={colors.primary}
                    />
                }
            >
                <ScrollView style={styles.container}>
                    <View style={styles.container_elementos}>
                        <Text style={styles.subtitle}>Saldo Investido: </Text>
                        <Text style={styles.title}>1000 </Text>
                    </View>


                    <View style={styles.acoes}>
                        <Botao
                            titulo={'Adicionar\nInvestimentos'}
                            onPress={() => console.log('Add invest')}
                            icone="add" />
                        <Botao
                            titulo={'Renda\nvariável'}
                            onPress={() => console.log('renda var')}
                            icone="trending-up" />
                        <Botao
                            titulo={'Renda\nfixa'}
                            onPress={() => console.log('renda fixa')} // mudar esse icone depois, n achei nenhum bom
                            icone="home" />
                        <Botao
                            titulo={'Acessoria'}
                            onPress={() => console.log('Acess')}
                            icone="chatbubbles" />
                        <Botao
                            titulo={'Meus\ninvestimentos'}
                            onPress={() => console.log('meus invests')}
                            icone="wallet" />
                    </View>

                    <View style={styles.container_elementos}>
                        <Text style={styles.title}>Renda Variável</Text>
                        {carregando && ativos.length === 0 ? (
                            <ActivityIndicator color={colors.primary} style={styles.estado} />
                        ) : null}
                        {erro ? (
                            <View style={styles.estado}>
                                <Text style={styles.erro}>{erro}</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => void carregarCotacoes()}
                                >
                                    <Text style={styles.tentarNovamente}>Tentar novamente</Text>
                                </Pressable>
                            </View>
                        ) : null}
                        {!carregando && !erro && ativos.length === 0 ? (
                            <Text style={styles.mensagemVazia}>Nenhuma cotação encontrada.</Text>
                        ) : null}
                        {ativos.map((ativo) => (
                            <CardAtivo
                                key={ativo.symbol}
                                ticker={ativo.symbol}
                                empresa={ativo.data.shortName ?? ativo.symbol}
                                preco={formatarPreco(ativo.data.regularMarketPrice)}
                                variacao={formatarVariacao(ativo.data.regularMarketChangePercent)}
                                logo={ativo.data.logourl ?? ''}
                            />
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: 14,
    },
    container_elementos: {
        padding: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
    },
    acoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    estado: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    erro: {
        color: colors.negative,
        textAlign: 'center',
    },
    tentarNovamente: {
        color: colors.primary,
        fontWeight: 'bold',
        padding: 8,
    },
    mensagemVazia: {
        color: colors.textMuted,
        paddingVertical: 16,
        textAlign: 'center',
    },
});
