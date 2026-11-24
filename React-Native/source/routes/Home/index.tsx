import { Text, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../shared/header';
import BalanceDivider from './components/balanceDivider';
import Estado from '../../shared/estado';
import { formatarReais } from '../../shared/currency';
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
    nome: string;
    valor: string;
    detalhe: string;
    positivo?: boolean;
};

const atalhos: Atalho[] = [
    { label: 'Adicionar Gasto', icone: 'card-outline', destino: 'NovoGasto' },
    { label: 'Adicionar Investimento', icone: 'trending-up-outline', destino: 'Investimentos' },
    { label: 'Meus Objetivos', icone: 'flag-outline', destino: 'Objetivos' },
    { label: 'Perfil', icone: 'person-outline', destino: 'Perfil' },
    { label: 'Ajuda', icone: 'help-circle-outline', destino: 'FAQ' },
];

// Valor sem o prefixo "R$ " (a coluna já tem o título "R$" no total).
function numeroBr(valor: number): string {
    return formatarReais(valor).replace('R$ ', '');
}

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
    total: string;
    itens: Item[];
    vazio: string;
};

function Resumo({ titulo, total, itens, vazio }: ResumoProps) {
    return (
        <View style={styles.secao}>
            <View style={styles.resumoTopo}>
                <Text style={styles.resumoTitulo}>{titulo}</Text>
                <Text style={styles.resumoTotal}>R$ {total}</Text>
            </View>

            <View style={styles.resumoCorpo}>
                <View style={styles.grafico} />
                <View style={styles.lista}>
                    {itens.length === 0 ? <Text style={styles.linhaNome}>{vazio}</Text> : null}
                    {itens.map((item) => (
                        <View key={item.nome} style={styles.linha}>
                            <Text style={styles.linhaNome}>{item.nome}</Text>
                            <Text style={styles.linhaValor}>{item.valor}</Text>
                            <Text style={[styles.linhaDetalhe, { color: corDoDetalhe(item) }]}>
                                {item.detalhe}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

async function carregarHome() {
    const [gastos, carteira, objetivos] = await Promise.all([
        obterResumoGastos(),
        obterCarteira(),
        listarObjetivos(),
    ]);
    return { gastos, carteira, objetivos };
}

export default function Home() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { dados, carregando, erro, recarregar } = useCarregar(carregarHome);

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

    const gastos = dados?.gastos;
    const carteira = dados?.carteira;
    const objetivos = dados?.objetivos ?? [];
    const objetivoPrincipal = objetivos[0];
    const objetivoInvestimento = objetivos.find((objetivo) => objetivo.categoria === 'Investimentos');
    const objetivoGasto = objetivos.find((objetivo) => objetivo.categoria === 'Gastos');

    const percentualUsado =
        gastos && gastos.orcamentoMensal > 0 ? Math.round((gastos.totalGasto / gastos.orcamentoMensal) * 100) : 0;

    const itensInvestimento: Item[] = [...(carteira?.ativos ?? [])]
        .sort((a, b) => b.valorAtual - a.valorAtual)
        .slice(0, 5)
        .map((ativo, indice) => ({
            nome: `${indice + 1}. ${ativo.simbolo}`,
            valor: numeroBr(ativo.valorAtual),
            detalhe: percentualComSinal(ativo.lucroPercentual),
            positivo: ativo.lucroPercentual >= 0,
        }));

    const itensGasto: Item[] = (gastos?.categorias ?? []).slice(0, 5).map((categoria, indice) => ({
        nome: `${indice + 1}. ${categoria.nome}`,
        valor: numeroBr(categoria.gasto),
        detalhe: `${Math.round(categoria.percentual)}%`,
    }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header />
            <ScrollView>
                <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                    <BalanceDivider
                        saldo={formatarReais(gastos?.saldo ?? 0)}
                        saldoDestaque={`${percentualUsado}% do orçamento usado`}
                        objetivo={objetivoPrincipal ? objetivoPrincipal.titulo : 'Nenhum objetivo'}
                        objetivoDestaque={
                            objetivoPrincipal ? `${Math.round(objetivoPrincipal.progresso)}% concluído` : 'Crie um objetivo'
                        }
                    />

                    <View style={styles.atalhos}>
                        {atalhos.map((atalho) => (
                            <TouchableOpacity
                                key={atalho.label}
                                style={styles.atalho}
                                onPress={() => abrir(atalho.destino)}
                            >
                                <View style={styles.atalhoIcone}>
                                    <Ionicons name={atalho.icone} size={22} color={colors.primary} />
                                </View>
                                <Text style={styles.atalhoLabel}>{atalho.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Meus objetivos</Text>
                        <View style={styles.objetivos}>
                            <View style={styles.objetivoColuna}>
                                <Text style={styles.objetivoTitulo}>Investimentos</Text>
                                {objetivoInvestimento ? (
                                    <>
                                        <Text style={styles.objetivoTexto}>1. {objetivoInvestimento.titulo}</Text>
                                        <Text style={styles.objetivoApoio}>
                                            {formatarReais(objetivoInvestimento.valorAtual)} /{' '}
                                            {formatarReais(objetivoInvestimento.valorAlvo)}
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
                                        <Text style={styles.objetivoTexto}>1. {objetivoGasto.titulo}</Text>
                                        <Text style={styles.objetivoApoio}>
                                            {formatarReais(objetivoGasto.valorAtual)} /{' '}
                                            {formatarReais(objetivoGasto.valorAlvo)}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.objetivoApoio}>Nenhum objetivo</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <Resumo
                        titulo="Investimentos"
                        total={numeroBr(carteira?.valorAtual ?? 0)}
                        itens={itensInvestimento}
                        vazio="Você ainda não tem investimentos."
                    />
                    <Resumo
                        titulo="Gastos"
                        total={numeroBr(gastos?.totalGasto ?? 0)}
                        itens={itensGasto}
                        vazio="Nenhum gasto registrado neste mês."
                    />
                </Estado>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resumoTitulo: {
        fontSize: 13,
        color: colors.textMuted,
    },
    resumoTotal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.text,
    },
    resumoCorpo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    grafico: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 14,
        borderColor: colors.primary,
        marginRight: 16,
    },
    lista: {
        flex: 1,
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
    },
    linhaNome: {
        flex: 1,
        fontSize: 12,
        color: colors.text,
    },
    linhaValor: {
        fontSize: 12,
        color: colors.textMuted,
        marginRight: 8,
    },
    linhaDetalhe: {
        fontSize: 12,
        fontWeight: 'bold',
        minWidth: 36,
        textAlign: 'right',
    },
});
