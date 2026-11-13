import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import { formatarReais } from '../../shared/currency';
import { colors } from '../../styles/colors';
import { categorias, orcamentoMensal, totalGasto } from './dados';
import type { GastosStackParamList } from './types';

type Atalho = {
    label: string;
    rota: Exclude<keyof GastosStackParamList, 'Gastos'>;
};

const atalhos: Atalho[] = [
    { label: 'Gastos fixos', rota: 'GastosFixos' },
    { label: 'Gastos variáveis', rota: 'GastosVariaveis' },
    { label: 'Histórico de gastos', rota: 'HistoricoGastos' },
];

export default function Gastos() {
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const percentual = Math.round((totalGasto / orcamentoMensal) * 100);

    return (
        <Layout titulo="Gastos">
            <Card rotulo="ORÇAMENTO MENSAL">
                <View style={styles.valores}>
                    <Text style={styles.total}>{formatarReais(totalGasto)} gastos</Text>
                    <Text style={styles.orcamento}>de {formatarReais(orcamentoMensal)}</Text>
                </View>
                <View style={styles.trilho}>
                    <View style={[styles.preenchimento, { width: `${percentual}%` }]} />
                </View>
                <Text style={styles.apoio}>{percentual}% do orçamento utilizado</Text>
            </Card>

            <Text style={styles.secao}>Gastos por categoria</Text>
            <Card>
                {categorias.map((categoria) => (
                    <View key={categoria.nome} style={styles.categoria}>
                        <View style={styles.categoriaTopo}>
                            <Text style={styles.categoriaNome}>{categoria.nome}</Text>
                            <Text style={styles.categoriaNome}>{categoria.percentual}%</Text>
                        </View>
                        <View style={styles.trilho}>
                            <View
                                style={[styles.preenchimento, { width: `${categoria.percentual}%` }]}
                            />
                        </View>
                    </View>
                ))}
            </Card>

            {atalhos.map((atalho) => (
                <Card key={atalho.rota} onPress={() => navigation.navigate(atalho.rota)}>
                    <View style={styles.atalho}>
                        <Text style={styles.atalhoTexto}>{atalho.label}</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                    </View>
                </Card>
            ))}
        </Layout>
    );
}

const styles = StyleSheet.create({
    valores: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    orcamento: {
        fontSize: 11,
        color: colors.textMuted,
    },
    trilho: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    preenchimento: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.negative,
    },
    apoio: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 8,
    },
    secao: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 8,
        marginBottom: 8,
    },
    categoria: {
        marginBottom: 12,
    },
    categoriaTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoriaNome: {
        fontSize: 12,
        color: colors.text,
    },
    atalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    atalhoTexto: {
        fontSize: 14,
        color: colors.text,
    },
});
