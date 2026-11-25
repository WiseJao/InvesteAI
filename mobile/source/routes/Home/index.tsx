import MarcadorCor from '../../shared/marcadorCor';
import { corDaConta, corDaCategoria } from '../../styles/coresDaConta';
import { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../shared/header';
import Estado from '../../shared/estado';
import { formatarReais } from '../../shared/currency';
import { usePrivacidade } from '../../shared/privacidade';
import { useCarregar } from '../../shared/useCarregar';
import { obterResumoGastos } from '../../services/gastos';
import { obterCarteira } from '../../services/carteira';
import { listarObjetivos } from '../../services/objetivos';
import { colors } from '../../styles/colors';
import type { HomeStackParamList } from './types';

type Atalho = {
    label: string;
    icone: keyof typeof Ionicons.glyphMap;
    destino: 'NovoGasto' | 'Investimentos' | Exclude<keyof HomeStackParamList, 'Home'>;
};

type Item = {
    id: string;
    cor: string;
    nome: string;
    valor: string;
    detalhe: string;
    positivo?: boolean;
    participacao: number;
};

const atalhos: Atalho[] = [
    { label: 'Adicionar Gasto', icone: 'card-outline', destino: 'NovoGasto' },
    { label: 'Adicionar Investimento', icone: 'trending-up-outline', destino: 'Investimentos' },
    { label: 'Meus Objetivos', icone: 'flag-outline', destino: 'Objetivos' },
    { label: 'Perfil', icone: 'person-outline', destino: 'Perfil' },
    { label: 'Ajuda', icone: 'help-circle-outline', destino: 'FAQ' },
];

function percentualComSinal(valor: number): string {
    const arredondado = Math.round(valor * 10) / 10;
    return `${arredondado > 0 ? '+' : ''}${arredondado}%`;
}

function corDoDetalhe(item: Item) {
    if (item.positivo === undefined) return colors.textMuted;
    return item.positivo ? colors.positive : colors.negative;
}

type ResumoProps = {
    titulo: string;
    subtitulo?: string;
    onVerTodos?: () => void;
    total: string;
    itens: Item[];
    vazio: string;
};

function Resumo({ titulo, subtitulo, total, itens, vazio, onVerTodos }: ResumoProps) {
    const { oculto } = usePrivacidade();
    return (
        <View style={styles.secao}>
            <View style={styles.resumoTopo}>
                <Text style={styles.resumoTitulo}>{titulo}</Text>
                <Text style={styles.resumoTotal}>{oculto ? 'Valores ocultos' : total}</Text>
            </View>

            {onVerTodos && <TouchableOpacity accessibilityRole="button" style={styles.botaoPeriodo} onPress={onVerTodos}><Text style={styles.link}>Ver todos · {titulo}</Text></TouchableOpacity>}
            {subtitulo && <Text style={styles.resumoApoio}>{subtitulo}</Text>}
            <View>
                {itens.length === 0 ? <Text style={styles.linhaNome}>{vazio}</Text> : null}
                {itens.map((item) => (
                    <View key={item.id} style={styles.grupoLinha}>
                        <View style={styles.linha}>
                            <MarcadorCor cor={item.cor} />
                            <Text style={styles.linhaNome}>{item.nome}</Text>
                            <Text style={styles.linhaValor}>{oculto ? '••••' : item.valor}</Text>
                            <Text style={[styles.linhaDetalhe, { color: oculto ? colors.textMuted : corDoDetalhe(item) }]}>
                                {oculto ? '••••' : item.detalhe}
                            </Text>
                        </View>
                        {!oculto && <View style={styles.trilho} accessible accessibilityLabel={`${Math.round(item.participacao)}% do total`}>
                            <View style={[styles.barra, { backgroundColor: item.cor, width: `${Math.max(0, Math.min(item.participacao, 100))}%` }]} />
                        </View>}
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function Home() {
    const { oculto } = usePrivacidade();
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const [mesesAtras, setMesesAtras] = useState(0);
    const agora = new Date();
    const data = new Date(agora.getFullYear(), agora.getMonth() - mesesAtras, 1);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    const [escolherMes, setEscolherMes] = useState(false);
    const [anoSelecao, setAnoSelecao] = useState(ano);
    const chavePeriodo = ano * 12 + mes;
    const estadoGastos = useCarregar(async () => ({ periodo: chavePeriodo, resumo: await obterResumoGastos({ mes, ano }) }), [chavePeriodo]);
    const estadoCarteira = useCarregar(obterCarteira);
    const estadoObjetivos = useCarregar(listarObjetivos);
    const atualizar = async () => { await Promise.all([estadoGastos.recarregar(), estadoCarteira.recarregar(), estadoObjetivos.recarregar()]); };

    function verLancamentos() {
        navigation.getParent<BottomTabNavigationProp<Record<string, object | undefined>>>()
            ?.navigate('Gastos', { screen: 'HistoricoGastos', params: { periodo: String(ano) + '-' + String(mes).padStart(2, '0'), consulta: Date.now() } });
    }

    function abrir(destino: Atalho['destino']) {
        if (destino === 'NovoGasto') {
            const abas = navigation.getParent<BottomTabNavigationProp<Record<string, object | undefined>>>();
            abas?.navigate('Gastos', { screen: 'NovoGasto', initial: false });
        } else if (destino === 'Investimentos') {
            navigation
                .getParent<BottomTabNavigationProp<Record<string, object | undefined>>>()
                ?.navigate('Investimentos', { screen: 'Investimentos', params: { adicionar: Date.now() } });
        } else {
            navigation.navigate(destino);
        }
    }

    const gastos = estadoGastos.dados?.periodo === chavePeriodo ? estadoGastos.dados.resumo : undefined;
    const carteira = estadoCarteira.dados;
    const fimDoMes = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;
    const posicoes = (carteira?.ativos ?? []).filter(ativo => ativo.dataCompra ? ativo.dataCompra <= fimDoMes : mesesAtras === 0);
    const totalDaCarteira = posicoes.reduce((total, ativo) => total + ativo.valorAtual, 0);
    const objetivos = estadoObjetivos.dados ?? [];
    const objetivoInvestimento = objetivos.find((objetivo) => objetivo.categoria === 'Investimentos');
    const objetivoGasto = objetivos.find((objetivo) => objetivo.categoria === 'Gastos');

    const percentualUsado =
        gastos && gastos.orcamentoMensal > 0 ? Math.round((gastos.totalGasto / gastos.orcamentoMensal) * 100) : 0;

    const itensInvestimento: Item[] = [...posicoes]
        .sort((a, b) => b.valorAtual - a.valorAtual)
        .slice(0, 5)
        .map(ativo => ({
            id: ativo.id,
            cor: corDaConta(ativo.id),
            nome: ativo.investmentType === 'FIXED_INCOME' ? ativo.nome : ativo.simbolo,
            valor: formatarReais(ativo.valorAtual),
            detalhe: percentualComSinal(ativo.lucroPercentual),
            positivo: ativo.lucroPercentual >= 0,
            participacao: totalDaCarteira > 0 ? ativo.valorAtual / totalDaCarteira * 100 : 0,
        }));

    const itensGasto: Item[] = (gastos?.categorias ?? []).slice(0, 5).map(categoria => ({
        id: categoria.nome,
        cor: corDaCategoria(categoria.nome),
        nome: categoria.nome,
        valor: formatarReais(categoria.gasto),
        detalhe: `${Math.round(categoria.percentual)}%`,
        participacao: categoria.percentual,
    }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header />
            <ScrollView refreshControl={<RefreshControl refreshing={estadoGastos.carregando || estadoCarteira.carregando || estadoObjetivos.carregando} onRefresh={atualizar} tintColor={colors.primary} />}>
                <View style={styles.periodo}>
                    <TouchableOpacity style={styles.botaoPeriodo} accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => setMesesAtras((valor) => valor + 1)}>
                        <Ionicons name="chevron-back" color={colors.primary} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: escolherMes }}
                        onPress={() => { setAnoSelecao(ano); setEscolherMes(v => !v); }} style={styles.botaoPeriodo}>
                        <Text style={styles.resumoTitulo}>Gastos de {data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botaoPeriodo} accessibilityRole="button" accessibilityLabel="Mês seguinte" disabled={mesesAtras === 0} onPress={() => setMesesAtras((valor) => Math.max(0, valor - 1))}>
                        <Ionicons name="chevron-forward" color={mesesAtras === 0 ? colors.textMuted : colors.primary} size={22} />
                    </TouchableOpacity>
                </View>
                {escolherMes && <View style={styles.secao}>
                    <View style={styles.periodo}>
                        <TouchableOpacity accessibilityRole="button" style={styles.botaoPeriodo} accessibilityLabel="Ano anterior" onPress={() => setAnoSelecao(v => v - 1)}><Text style={styles.link}>‹</Text></TouchableOpacity>
                        <Text style={styles.secaoTitulo}>{anoSelecao}</Text>
                        <TouchableOpacity accessibilityRole="button" style={styles.botaoPeriodo} accessibilityLabel="Ano seguinte" disabled={anoSelecao >= agora.getFullYear()} onPress={() => setAnoSelecao(v => v + 1)}><Text style={styles.link}>›</Text></TouchableOpacity>
                    </View>
                    <View style={styles.meses}>
                        {Array.from({ length: 12 }, (_, i) => {
                            const deslocamento = (agora.getFullYear() - anoSelecao) * 12 + agora.getMonth() - i;
                            if (deslocamento < 0) return null;
                            const nome = new Date(anoSelecao, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
                            return <TouchableOpacity key={i} accessibilityRole="button" accessibilityState={{ selected: deslocamento === mesesAtras }}
                                style={[styles.botaoPeriodo, deslocamento === mesesAtras && styles.mesAtivo]} onPress={() => { setMesesAtras(deslocamento); setEscolherMes(false); }}>
                                <Text style={styles.link}>{nome}</Text>
                            </TouchableOpacity>;
                        })}
                    </View>
                </View>}
                {mesesAtras > 0 && <TouchableOpacity accessibilityRole="button" style={styles.botaoPeriodo} onPress={() => { setMesesAtras(0); setEscolherMes(false); }}>
                    <Text style={styles.link}>Voltar ao mês atual</Text>
                </TouchableOpacity>}
                <Estado {...estadoGastos} temDados={gastos !== undefined} onTentarNovamente={estadoGastos.recarregar}>
                    {gastos && <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Saldo do mês</Text>
                        <Text style={styles.resumoTotal}>{oculto ? 'Valor oculto' : formatarReais(gastos.saldo)}</Text>
                        <Text style={styles.resumoApoio}>{oculto ? 'Percentual oculto' : gastos.orcamentoMensal > 0 ? percentualUsado + '% do orçamento usado' : 'Orçamento sem renda prevista ou receitas'}</Text>
                    </View>}
                </Estado>
                    <View style={styles.atalhos}>
                        {atalhos.map((atalho) => (
                            <TouchableOpacity
                                key={atalho.label}
                                style={styles.atalho}
                                onPress={() => abrir(atalho.destino)}
                                accessibilityRole="button"
                            >
                                <View style={styles.atalhoIcone}>
                                    <Ionicons name={atalho.icone} size={22} color={colors.primary} />
                                </View>
                                <Text style={styles.atalhoLabel}>{atalho.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                <Estado {...estadoObjetivos} temDados={estadoObjetivos.dados !== null} onTentarNovamente={estadoObjetivos.recarregar}>
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>{mesesAtras > 0 ? 'Meus objetivos atuais' : 'Meus objetivos'}</Text>
                        <TouchableOpacity accessibilityRole="button" style={styles.botaoPeriodo} onPress={() => abrir('Objetivos')}><Text style={styles.link}>Ver todas as metas</Text></TouchableOpacity>
                        <View style={styles.objetivos}>
                            <View style={styles.objetivoColuna}>
                                <Text style={styles.objetivoTitulo}>Investimentos</Text>
                                {objetivoInvestimento ? (
                                    <>
                                        <Text style={styles.objetivoTexto}>{objetivoInvestimento.titulo}</Text>
                                        <Text style={styles.objetivoApoio}>
                                            {oculto ? 'Valores ocultos' : `${formatarReais(objetivoInvestimento.valorAtual)} / ${formatarReais(objetivoInvestimento.valorAlvo)}`}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.objetivoApoio}>Nenhum objetivo</Text>
                                )}
                            </View>
                            <View style={styles.objetivoDivisor} />
                            <View style={styles.objetivoColuna}>
                                <Text style={styles.objetivoTitulo}>Gastos</Text>
                                {objetivoGasto ? (
                                    <>
                                        <Text style={styles.objetivoTexto}>{objetivoGasto.titulo}</Text>
                                        <Text style={styles.objetivoApoio}>
                                            {oculto ? 'Valores ocultos' : `${formatarReais(objetivoGasto.valorAtual)} / ${formatarReais(objetivoGasto.valorAlvo)}`}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.objetivoApoio}>Nenhum objetivo</Text>
                                )}
                            </View>
                        </View>
                    </View>

                </Estado>
                <Estado {...estadoCarteira} temDados={carteira !== null} onTentarNovamente={estadoCarteira.recarregar}>
                    <Resumo
                        titulo={posicoes.some((ativo) => ativo.priceStatus !== 'MARKET') ? 'Investimentos · valor de referência' : 'Investimentos'}
                        onVerTodos={() => navigation.getParent<BottomTabNavigationProp<Record<string, object | undefined>>>()?.navigate('Investimentos', { screen: 'Investimentos', params: { abrirCarteira: Date.now() } })}
                        subtitulo={mesesAtras > 0 ? 'Posições registradas até o fim do mês · valores atuais' : undefined}
                        total={formatarReais(totalDaCarteira)}
                        itens={itensInvestimento}
                        vazio={mesesAtras > 0 ? 'Nenhuma posição registrada até este mês.' : 'Você ainda não tem investimentos.'}
                    />
                </Estado>
                    {gastos ? <Resumo
                        titulo="Gastos"
                        onVerTodos={verLancamentos}
                        total={formatarReais(gastos.totalGasto)}
                        itens={itensGasto}
                        vazio="Nenhum gasto registrado neste mês."
                    /> : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    meses: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    mesAtivo: { backgroundColor: colors.surface, borderRadius: 8 },
    link: { color: colors.primary, paddingHorizontal: 6 },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    atalhos: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 20,
    },
    atalho: {
        alignItems: 'center',
        width: 68,
    },
    atalhoIcone: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    atalhoLabel: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 6,
    },
    secao: {
        borderTopWidth: 1,
        borderTopColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    secaoTitulo: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 12,
    },
    objetivos: {
        flexDirection: 'row',
    },
    objetivoColuna: {
        flex: 1,
        paddingHorizontal: 8,
    },
    objetivoDivisor: {
        width: 1,
        backgroundColor: colors.border,
    },
    objetivoTitulo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },
    objetivoTexto: {
        fontSize: 12,
        color: colors.text,
    },
    objetivoApoio: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
    resumoTopo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 8,
        rowGap: 4,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resumoTitulo: {
        fontSize: 13,
        color: colors.textMuted,
    },
    resumoApoio: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
    resumoTotal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.text,
    },
    periodo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16 },
    botaoPeriodo: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    grupoLinha: { marginBottom: 8 },
    trilho: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    barra: { height: 5, backgroundColor: colors.primary, borderRadius: 3 },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        gap: 8,
    },
    linhaNome: {
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        color: colors.text,
    },
    linhaValor: {
        fontSize: 12,
        color: colors.textMuted,
    },
    linhaDetalhe: {
        fontSize: 12,
        fontWeight: 'bold',
        minWidth: 36,
        textAlign: 'right',
    },
});
