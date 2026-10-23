import { Text, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../shared/header';
import BalanceDivider from './components/balanceDivider';
import { colors } from '../../styles/colors';
import type { HomeStackParamList } from './types';

type Atalho = {
    label: string;
    icone: keyof typeof Ionicons.glyphMap;
    rota?: Exclude<keyof HomeStackParamList, 'Home'>;
};

type Item = {
    nome: string;
    valor: string;
    detalhe: string;
    positivo?: boolean;
};

const atalhos: Atalho[] = [
    { label: 'Adicionar Gasto', icone: 'card-outline' },
    { label: 'Adicionar Investimento', icone: 'trending-up-outline' },
    { label: 'Meus Objetivos', icone: 'flag-outline', rota: 'Objetivos' },
    { label: 'Perfil', icone: 'person-outline', rota: 'Perfil' },
    { label: 'Ajuda', icone: 'help-circle-outline', rota: 'FAQ' },
];

const investimentos: Item[] = [
    { nome: '1. NVDA', valor: '1.234,90', detalhe: '+12%', positivo: true },
    { nome: '2. AMD', valor: '1.234,90', detalhe: '+12%', positivo: true },
    { nome: '3. VALE3', valor: '1.234,90', detalhe: '-12%', positivo: false },
    { nome: '4. BTC', valor: '1.234,90', detalhe: '+12%', positivo: true },
    { nome: '5. ETF', valor: '1.234,90', detalhe: '+12%', positivo: true },
];

const gastos: Item[] = [
    { nome: '1. Aluguel', valor: '12.345', detalhe: '25%' },
    { nome: '2. Comida', valor: '8.000', detalhe: '12%' },
    { nome: '3. Lazer', valor: '1.200', detalhe: '8%' },
    { nome: '4. Jogos', valor: '400', detalhe: '2%' },
    { nome: '5. Outros', valor: '100', detalhe: '<1%' },
];

function corDoDetalhe(item: Item) {
    if (item.positivo === undefined) return colors.textMuted;
    return item.positivo ? colors.positive : colors.negative;
}

type ResumoProps = {
    titulo: string;
    total: string;
    itens: Item[];
};

function Resumo({ titulo, total, itens }: ResumoProps) {
    return (
        <View style={styles.secao}>
            <View style={styles.resumoTopo}>
                <Text style={styles.resumoTitulo}>{titulo}</Text>
                <Text style={styles.resumoTotal}>R$ {total}</Text>
            </View>

            <View style={styles.resumoCorpo}>
                <View style={styles.grafico} />
                <View style={styles.lista}>
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

export default function Home() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header/>
            <ScrollView>
                <BalanceDivider/>

                <View style={styles.atalhos}>
                    {atalhos.map((atalho) => (
                        <TouchableOpacity
                            key={atalho.label}
                            style={styles.atalho}
                            onPress={atalho.rota ? () => navigation.navigate(atalho.rota!) : undefined}
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
                            <Text style={styles.objetivoTexto}>1. R$ 999,99</Text>
                            <Text style={styles.objetivoApoio}>1.700 / 100.000 investidos</Text>
                        </View>
                        <View style={styles.objetivoDivisor} />
                        <View style={styles.objetivoColuna}>
                            <Text style={styles.objetivoTitulo}>Gastos</Text>
                            <Text style={styles.objetivoTexto}>1. Reduzir gastos com comida</Text>
                        </View>
                    </View>
                </View>

                <Resumo titulo="Investimentos" total="1.234.567,90" itens={investimentos} />
                <Resumo titulo="Gastos" total="12.345.678,90" itens={gastos} />
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
