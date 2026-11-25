import MarcadorCor from '../../shared/marcadorCor';
import { corDaConta } from '../../styles/coresDaConta';
import ImagemAtivo from './components/ImagemAtivo';
import { useCallback, useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
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
import { confirmarDescarte } from '../../shared/useConfirmarSaida';
import Field from '../../shared/field';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import { mensagemDeErro } from '../../services/api';
import FormNovoAtivo from './components/FormNovoAtivo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../shared/header';
import { formatarReais } from '../../shared/currency';
import { usePrivacidade } from '../../shared/privacidade';
import { useCarregar } from '../../shared/useCarregar';
import { buscarAtivos, obterCarteira, type Ativo, type ResultadoBusca, type TipoInvestimento } from '../../services/carteira';
import { colors } from '../../styles/colors';

type Cotacao = {
    symbol: string;
    shortName?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    regularMarketTime?: string;
    logourl?: string;
    logoUrl?: string;
};

type RespostaCotacoes = {
    results?: Cotacao[];
    unavailableSymbols?: string[];
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

function formatarDataCotacao(data: string) {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
}

export default function Investimentos() {
    const { oculto } = usePrivacidade();
    const [ativos, setAtivos] = useState<Cotacao[]>([]);
    const [indisponiveis, setIndisponiveis] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
    const [tipoEscolhido, setTipoEscolhido] = useState<(typeof OPCOES_INVESTIMENTO)[number] | null>(null);
    const [ativoEditando, setAtivoEditando] = useState<Ativo | null>(null);
    const [filtro, setFiltro] = useState<TipoInvestimento | 'TODOS'>('TODOS');
    const [area, setArea] = useState<'carteira' | 'mercado'>('carteira');
    const [buscaCarteira, setBuscaCarteira] = useState('');
    const [buscaMercado, setBuscaMercado] = useState('');
    const [achadosMercado, setAchadosMercado] = useState<ResultadoBusca[]>([]);
    const [buscandoMercado, setBuscandoMercado] = useState(false);
    const [erroMercado, setErroMercado] = useState<string | null>(null);
    const [tentativaMercado, setTentativaMercado] = useState(0);
    const [ativoInicial, setAtivoInicial] = useState<ResultadoBusca | undefined>();
    const [formAlterado, setFormAlterado] = useState(false);
    const route = useRoute<{ key: string; name: string; params?: { adicionar?: number; abrirCarteira?: number } }>();
    const { dados: carteira, carregando: carregandoCarteira, erro: erroCarteira, recarregar: recarregarCarteira } = useCarregar(obterCarteira);
    const ativosFiltrados = (carteira?.ativos ?? []).filter(ativo => (filtro === 'TODOS' || ativo.investmentType === filtro) && (ativo.nome + ' ' + ativo.simbolo).toLowerCase().includes(buscaCarteira.trim().toLowerCase()));

    const avaliacaoAproximada = carteira?.ativos.some((ativo) => ativo.priceStatus !== 'MARKET');

    useEffect(() => {
        const termo = buscaMercado.trim();
        setAchadosMercado([]);
        setErroMercado(null);
        setBuscandoMercado(termo.length >= 2);
        if (termo.length < 2) return;
        let vigente = true;
        const timer = setTimeout(() => {
            void buscarAtivos(termo).then(itens => { if (vigente) setAchadosMercado(itens); })
                .catch(falha => { if (vigente) setErroMercado(mensagemDeErro(falha)); })
                .finally(() => { if (vigente) setBuscandoMercado(false); });
        }, 350);
        return () => { vigente = false; clearTimeout(timer); };
    }, [buscaMercado, tentativaMercado]);

    function adicionarSelecionado(ativo: ResultadoBusca) {
        setAtivoInicial(ativo);
        setTipoEscolhido('Renda variável');
        setModalAdicionarVisivel(true);
    }

    // Atalho "Adicionar Investimento" da Home abre direto o cadastro.
    const pedidoCarteira = route.params?.abrirCarteira;
    useEffect(() => { if (pedidoCarteira) setArea('carteira'); }, [pedidoCarteira]);
    const pedidoDeAdicionar = route.params?.adicionar;
    useEffect(() => {
        if (pedidoDeAdicionar) setModalAdicionarVisivel(true);
    }, [pedidoDeAdicionar]);

    function fecharModal() {
        setModalAdicionarVisivel(false);
        setTipoEscolhido(null);
        setAtivoEditando(null);
        setAtivoInicial(undefined);
        setFormAlterado(false);
    }

    function solicitarFechamento() {
        if (formAlterado) confirmarDescarte(fecharModal);
        else fecharModal();
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
            setIndisponiveis(dados.unavailableSymbols ?? []);
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
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={area === 'mercado' ? carregando : carregandoCarteira}
                        onRefresh={() => {
                            if (area === 'mercado') void carregarCotacoes();
                            else void recarregarCarteira();
                        }}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.container}>
                    <View style={styles.container_elementos}>
                        <Opcoes rotulo="Investimentos" opcoes={[{ valor: 'carteira', texto: 'Minha carteira' }, { valor: 'mercado', texto: 'Mercado' }]} selecionado={area} onSelecionar={setArea} />
                    </View>
                    {area === 'carteira' && <>
                    <View style={styles.container_elementos}>
                        <Text style={styles.subtitle}>{avaliacaoAproximada ? 'Valor de referência da carteira' : 'Valor de mercado da carteira'}</Text>
                        <Text style={styles.title}>{oculto ? 'Valores ocultos' : carteira ? formatarReais(carteira.valorAtual) : 'Indisponível'}</Text>
                        {carteira ? (
                            <Text style={styles.subtitle}>
                                {oculto ? 'Valores ocultos' : `Investido: ${formatarReais(carteira.totalInvestido)} · ${avaliacaoAproximada ? 'Resultado de referência' : 'Resultado'}: ${formatarReais(carteira.lucro)}`}
                            </Text>
                        ) : null}
                    </View>

                    <View style={[styles.container_elementos, styles.bloco]}>
                        <Field label="Buscar na carteira" value={buscaCarteira} onChangeText={setBuscaCarteira} returnKeyType="search" />
                        <Opcoes rotulo="Tipo de posição" opcoes={[{ valor: 'TODOS', texto: 'Todos' }, { valor: 'FIXED_INCOME', texto: 'Renda fixa' }, { valor: 'VARIABLE_INCOME', texto: 'Renda variável' }]} selecionado={filtro} onSelecionar={setFiltro} />
                        {(filtro !== 'TODOS' || buscaCarteira) && <Pressable accessibilityRole="button" style={{ minHeight: 48 }} onPress={() => { setFiltro('TODOS'); setBuscaCarteira(''); }}><Text style={styles.tentarNovamente}>Limpar filtros</Text></Pressable>}
                        <BotaoPrimario titulo="Adicionar investimento" onPress={() => setModalAdicionarVisivel(true)} />
                        {carregandoCarteira && !carteira ? <ActivityIndicator color={colors.primary} /> : null}
                        {erroCarteira ? <Pressable accessibilityRole="button" onPress={recarregarCarteira}><Text style={styles.erro}>{erroCarteira} Toque para tentar novamente.</Text></Pressable> : null}
                        {carteira && ativosFiltrados.length === 0 ? (
                            <Text style={styles.mensagemVazia}>Nenhum investimento neste filtro.</Text>
                        ) : null}
                        {ativosFiltrados.map((ativo) => (
                            <Pressable
                                key={ativo.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Editar investimento ${ativo.nome}`}
                                style={styles.linhaCarteira}
                                onPress={() => setAtivoEditando(ativo)}
                            >
                                <ImagemAtivo uri={ativo.logoUrl} fixed={ativo.investmentType === 'FIXED_INCOME'} />
                                <View style={styles.linhaCarteiraNome}>
                                    <View style={styles.nomeCarteira}>
                                        <MarcadorCor cor={corDaConta(ativo.id)} />
                                        <Text style={[styles.title, { flexShrink: 1 }]}>{ativo.investmentType === 'FIXED_INCOME' ? ativo.nome : ativo.simbolo}</Text>
                                    </View>
                                    <Text style={styles.subtitle}>{ativo.fixedIncome?.product ? ({ CDB: 'CDB', CAIXINHA: 'Caixinha', OTHER: 'Outro' } as const)[ativo.fixedIncome.product] : oculto ? 'Quantidade oculta' : `${ativo.quantidade} un.`}</Text>
                                    <Text style={styles.subtitle}>{ativo.investmentType === 'FIXED_INCOME' ? `Renda fixa${ativo.fixedIncome?.cdiPercentage ? (oculto ? ' · Taxa oculta' : ' · ' + ativo.fixedIncome.cdiPercentage + '% do CDI') : ativo.annualRate == null ? '' : oculto ? ' · Taxa oculta' : ` · ${ativo.annualRate}% a.a.`}` : 'Renda variável'}</Text>
                                </View>
                                <View style={styles.linhaCarteiraValor}>
                                    <Text style={styles.title}>{oculto ? 'Valores ocultos' : formatarReais(ativo.valorAtual)}</Text>
                                    {ativo.investmentType === 'FIXED_INCOME' && ativo.priceStatus !== 'UNAVAILABLE' ? <Text style={styles.subtitle}>Estimativa bruta{ativo.valuationThrough ? ' · ' + ativo.valuationThrough.split('-').reverse().join('/') : ''}</Text> : null}
                                    {ativo.priceStatus === 'UNAVAILABLE' ? <Text style={styles.subtitle}>{ativo.investmentType === 'FIXED_INCOME' ? 'Estimativa indisponível' : 'Cotação indisponível'} · valor pelo custo de compra</Text> : ativo.priceStatus === 'STALE' ? <Text style={styles.subtitle}>{ativo.investmentType === 'FIXED_INCOME' ? 'Série CDI desatualizada' : 'Cotação possivelmente desatualizada'}</Text> : null}
                                    {ativo.quotedAt ? <Text style={styles.subtitle}>Cotação de {formatarDataCotacao(ativo.quotedAt)}</Text> : null}
                                    <Text
                                        style={[
                                            styles.subtitle,
                                            { color: oculto ? colors.textMuted : ativo.lucro >= 0 ? colors.positive : colors.negative },
                                        ]}
                                    >
                                        {oculto ? '••••' : `${ativo.lucro >= 0 ? '+' : ''}${ativo.lucroPercentual.toFixed(2)}%`}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    </>}
                    {area === 'mercado' && <View style={styles.container_elementos}>
                        <Text accessibilityRole="header" style={styles.title}>Mercado</Text>
                        <Field label="Buscar ativo por nome ou ticker" value={buscaMercado} onChangeText={setBuscaMercado} returnKeyType="search" />
                        {buscandoMercado && <ActivityIndicator color={colors.primary} accessibilityLabel="Buscando ativos" />}
                        {erroMercado && <Pressable accessibilityRole="button" onPress={() => setTentativaMercado(v => v + 1)} style={{ minHeight: 48 }}><Text style={styles.erro}>{erroMercado} Tentar novamente</Text></Pressable>}
                        {buscaMercado.trim().length >= 2 && !buscandoMercado && !erroMercado && !achadosMercado.length && <Text style={styles.mensagemVazia}>Nenhum ativo encontrado.</Text>}
                        {buscaMercado.trim().length < 2 && carregando && ativos.length === 0 ? (
                            <ActivityIndicator color={colors.primary} style={styles.estado} />
                        ) : null}
                        {buscaMercado.trim().length < 2 && erro ? (
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
                        {buscaMercado.trim().length < 2 && !carregando && !erro && indisponiveis.length > 0 ? (
                            <Text style={styles.mensagemVazia}>Cotações indisponíveis para {indisponiveis.join(', ')}.</Text>
                        ) : null}
                        {buscaMercado.trim().length < 2 && !carregando && !erro && ativos.length === 0 && indisponiveis.length === 0 ? (
                            <Text style={styles.mensagemVazia}>Nenhuma cotação encontrada.</Text>
                        ) : null}
                        {(buscaMercado.trim().length < 2 ? ativos : achadosMercado.map(item => ativos.find(quote => quote.symbol === item.simbolo) ?? { symbol: item.simbolo, shortName: item.nome } as Cotacao)).map((ativo) => (
                            <CardAtivo
                                key={ativo.symbol}
                                ticker={ativo.symbol}
                                empresa={ativo.shortName ?? ativo.symbol}
                                preco={formatarPreco(ativo.regularMarketPrice)}
                                variacao={formatarVariacao(ativo.regularMarketChangePercent)}
                                logo={ativo.logoUrl ?? ativo.logourl ?? ''}
                                dataCotacao={ativo.regularMarketTime ? formatarDataCotacao(ativo.regularMarketTime) : undefined}
                                onAdicionar={() => adicionarSelecionado({ simbolo: ativo.symbol, nome: ativo.shortName ?? ativo.symbol })}
                            />
                        ))}
                    </View>}
                </View>

            </ScrollView>

            <Modal
                animationType="fade"
                transparent
                visible={modalAdicionarVisivel || ativoEditando !== null}
                onRequestClose={solicitarFechamento}
            >
                <View style={styles.modalContainer}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Fechar opções de investimento"
                        style={styles.modalBackdrop}
                        onPress={solicitarFechamento}
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
                                onCancelar={solicitarFechamento}
                                onAlterado={setFormAlterado}
                                onSalvo={() => {
                                    fecharModal();
                                    setArea('carteira');
                                    recarregarCarteira();
                                }}
                            />
                        ) : tipoEscolhido ? (
                            <FormNovoAtivo
                                tipo={tipoEscolhido}
                                ativoInicial={ativoInicial}
                                onCancelar={solicitarFechamento}
                                onAlterado={setFormAlterado}
                                onSalvo={() => {
                                    fecharModal();
                                    setArea('carteira');
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
                                        accessibilityLabel={opcao}
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
        columnGap: 8,
        minHeight: 56,
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 8,
    },
    nomeCarteira: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    linhaCarteiraNome: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    linhaCarteiraValor: {
        maxWidth: '42%',
        alignItems: 'flex-end',
        gap: 2,
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
