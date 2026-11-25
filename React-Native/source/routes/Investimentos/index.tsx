import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardAtivo from './components/CardAtivo';
import Botao from './components/Botao';
import FormNovoAtivo from './components/FormNovoAtivo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../shared/header';
import { formatarReais } from '../../shared/currency';
import { usePrivacidade } from '../../shared/privacidade';
import { useCarregar } from '../../shared/useCarregar';
import { obterCarteira, type Ativo, type TipoInvestimento } from '../../services/carteira';
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
const OPCOES_INVESTIMENTO = ['Renda variável', 'Renda fixa'] as const;

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
    const { oculto } = usePrivacidade();
    const [ativos, setAtivos] = useState<Cotacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
    const [tipoEscolhido, setTipoEscolhido] = useState<(typeof OPCOES_INVESTIMENTO)[number] | null>(null);
    const [ativoEditando, setAtivoEditando] = useState<Ativo | null>(null);
    const [filtro, setFiltro] = useState<TipoInvestimento | 'TODOS'>('TODOS');
    const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
    const carteiraY = useRef(0);
    const navigation = useNavigation();
    const route = useRoute<{ key: string; name: string; params?: { adicionar?: number } }>();
    const { dados: carteira, carregando: carregandoCarteira, erro: erroCarteira, recarregar: recarregarCarteira } = useCarregar(obterCarteira);
    const ativosFiltrados = (carteira?.ativos ?? []).filter((ativo) => filtro === 'TODOS' || ativo.investmentType === filtro);

    function mostrarCarteira(tipo: TipoInvestimento | 'TODOS') {
        setFiltro(tipo);
        rolagem.current?.scrollTo({ y: carteiraY.current, animated: true });
    }

    // Atalho "Adicionar Investimento" da Home abre direto o cadastro.
    const pedidoDeAdicionar = route.params?.adicionar;
    useEffect(() => {
        if (pedidoDeAdicionar) setModalAdicionarVisivel(true);
    }, [pedidoDeAdicionar]);

    function fecharModal() {
        setModalAdicionarVisivel(false);
        setTipoEscolhido(null);
        setAtivoEditando(null);
    }

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
            <Header />

            <ScrollView
                ref={rolagem}
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={carregando}
                        onRefresh={() => {
                            void carregarCotacoes();
                            recarregarCarteira();
                        }}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.container}>
                    <View style={styles.container_elementos}>
                        <Text style={styles.subtitle}>Saldo Investido: </Text>
                        <Text style={styles.title}>{oculto ? 'Valores ocultos' : carteira ? formatarReais(carteira.valorAtual) : 'Indisponível'}</Text>
                        {carteira ? (
                            <Text style={styles.subtitle}>
                                {oculto ? 'Valores ocultos' : `Investido: ${formatarReais(carteira.totalInvestido)} · Resultado: ${formatarReais(carteira.lucro)}`}
                            </Text>
                        ) : null}
                    </View>

                    <View style={[styles.container_elementos, styles.bloco]} onLayout={(evento) => { carteiraY.current = evento.nativeEvent.layout.y; }}>
                        <Text style={styles.title}>Minha carteira {filtro === 'FIXED_INCOME' ? '— Renda fixa' : filtro === 'VARIABLE_INCOME' ? '— Renda variável' : '— Todos (inclui legados)'}</Text>
                        {carregandoCarteira && !carteira ? <ActivityIndicator color={colors.primary} /> : null}
                        {erroCarteira ? <Pressable accessibilityRole="button" onPress={recarregarCarteira}><Text style={styles.erro}>{erroCarteira} Toque para tentar novamente.</Text></Pressable> : null}
                        {carteira && ativosFiltrados.length === 0 ? (
                            <Text style={styles.mensagemVazia}>Nenhum investimento neste filtro.</Text>
                        ) : null}
                        {ativosFiltrados.map((ativo) => (
                            <Pressable
                                key={ativo.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Editar investimento ${ativo.simbolo}`}
                                style={styles.linhaCarteira}
                                onPress={() => setAtivoEditando(ativo)}
                            >
                                <View style={styles.linhaCarteiraNome}>
                                    <Text style={styles.title}>{ativo.simbolo}</Text>
                                    <Text style={styles.subtitle}>{oculto ? 'Quantidade oculta' : `${ativo.quantidade} un.`}</Text>
                                    <Text style={styles.subtitle}>{ativo.investmentType === 'LEGACY' ? 'Legado' : ativo.investmentType === 'FIXED_INCOME' ? `Renda fixa${ativo.annualRate == null ? '' : oculto ? ' · Taxa oculta' : ` · ${ativo.annualRate}% a.a.`}` : 'Renda variável'}</Text>
                                </View>
                                <View style={styles.linhaCarteiraValor}>
                                    <Text style={styles.title}>{oculto ? 'Valores ocultos' : formatarReais(ativo.valorAtual)}</Text>
                                    {ativo.investmentType === 'FIXED_INCOME' ? <Text style={styles.subtitle}>Valor estimado</Text> : null}
                                    {ativo.priceStatus === 'UNAVAILABLE' ? <Text style={styles.subtitle}>Cotação indisponível</Text> : ativo.priceStatus === 'STALE' ? <Text style={styles.subtitle}>Cotação possivelmente desatualizada</Text> : null}
                                    <Text
                                        style={[
                                            styles.subtitle,
                                            { color: oculto ? colors.textMuted : ativo.lucro >= 0 ? colors.positive : colors.negative },
                                        ]}
                                    >
                                        {oculto ? 'Percentual oculto' : `${ativo.lucro >= 0 ? '+' : ''}${ativo.lucroPercentual.toFixed(2)}%`}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>


                    <View style={styles.acoes}>
                        <Botao
                            titulo={'Adicionar\nInvestimentos'}
                            onPress={() => setModalAdicionarVisivel(true)}
                            icone="add" />
                        <Botao
                            titulo={'Renda\nvariável'}
                            onPress={() => mostrarCarteira('VARIABLE_INCOME')}
                            icone="trending-up" />
                        <Botao
                            titulo={'Renda\nfixa'}
                            onPress={() => mostrarCarteira('FIXED_INCOME')}
                            icone="home" />
                        <Botao
                            titulo={'Acessoria'}
                            onPress={() => navigation.getParent()?.navigate('AI' as never)}
                            icone="chatbubbles" />
                        <Botao
                            titulo={'Meus\ninvestimentos'}
                            onPress={() => mostrarCarteira('TODOS')}
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
                </View>

            </ScrollView>

            <Modal
                animationType="fade"
                transparent
                visible={modalAdicionarVisivel || ativoEditando !== null}
                onRequestClose={fecharModal}
            >
                <View style={styles.modalContainer}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Fechar opções de investimento"
                        style={styles.modalBackdrop}
                        onPress={fecharModal}
                    />
                    <ScrollView
                        accessibilityViewIsModal
                        style={styles.modalConteudo}
                        keyboardShouldPersistTaps="handled"
                    >
                        {ativoEditando ? (
                            <FormNovoAtivo
                                key={ativoEditando.id}
                                tipo="Editar investimento"
                                ativo={ativoEditando}
                                onCancelar={fecharModal}
                                onSalvo={() => {
                                    fecharModal();
                                    recarregarCarteira();
                                }}
                            />
                        ) : tipoEscolhido ? (
                            <FormNovoAtivo
                                tipo={tipoEscolhido}
                                onCancelar={fecharModal}
                                onSalvo={() => {
                                    fecharModal();
                                    recarregarCarteira();
                                }}
                            />
                        ) : (
                            <>
                                <Text style={styles.modalTitulo}>Adicionar investimento</Text>
                                <Text style={styles.modalDescricao}>
                                    Escolha o tipo de investimento que deseja adicionar.
                                </Text>
                                {OPCOES_INVESTIMENTO.map((opcao) => (
                                    <Pressable
                                        key={opcao}
                                        accessibilityRole="button"
                                        style={styles.opcaoInvestimento}
                                        onPress={() => setTipoEscolhido(opcao)}
                                    >
                                        <Text style={styles.opcaoTexto}>{opcao}</Text>
                                        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                                    </Pressable>
                                ))}
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>
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
    bloco: {
        marginTop: 12,
    },
    linhaCarteira: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 8,
    },
    linhaCarteiraNome: {
        gap: 2,
    },
    linhaCarteiraValor: {
        alignItems: 'flex-end',
        gap: 2,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalConteudo: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        maxHeight: '90%',
    },
    modalTitulo: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalDescricao: {
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 8,
        marginBottom: 16,
    },
    opcaoInvestimento: {
        alignItems: 'center',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 52,
    },
    opcaoTexto: {
        color: colors.text,
        fontSize: 16,
    },
});
