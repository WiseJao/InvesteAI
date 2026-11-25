import ProgressoOrcamento from '../../shared/progressoOrcamento';
import BotaoPrimario from '../../shared/botaoPrimario';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AbasParamList } from '../types';
import MarcadorCor from '../../shared/marcadorCor';
import { corDaCategoria } from '../../styles/coresDaConta';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import Estado from '../../shared/estado';
import { formatarReais } from '../../shared/currency';
import { usePrivacidade } from '../../shared/privacidade';
import { useCarregar } from '../../shared/useCarregar';
import { obterResumoGastos } from '../../services/gastos';
import { colors } from '../../styles/colors';
import type { GastosStackParamList } from './types';

type Atalho = {
    label: string;
    rota: Exclude<keyof GastosStackParamList, 'ResumoGastos'>;
};

const atalhos: Atalho[] = [
    { label: 'Gastos fixos', rota: 'GastosFixos' },
    { label: 'Gastos variáveis', rota: 'GastosVariaveis' },
    { label: 'Lançamentos', rota: 'HistoricoGastos' },
];

export default function Gastos() {
    const { oculto } = usePrivacidade();
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const { dados: resumo, carregando, erro, recarregar } = useCarregar(obterResumoGastos);

    const orcamento = resumo?.orcamentoMensal ?? 0;
    const gasto = resumo?.totalGasto ?? 0;
    const categorias = resumo?.categorias ?? [];

    return (
        <Layout titulo="Gastos">
            <BotaoPrimario titulo="Adicionar gasto ou receita" onPress={() => navigation.navigate('NovoGasto')} />
            <Estado carregando={carregando} erro={erro} temDados={resumo !== null} onTentarNovamente={recarregar}>
                <Card rotulo="ORÇAMENTO MENSAL">
                    <View style={styles.valores}>
                        <Text style={styles.total}>{oculto ? 'Valores ocultos' : `${formatarReais(gasto)} gastos`}</Text>
                        <Text style={styles.orcamento}>{oculto ? '••••' : `de ${formatarReais(orcamento)}`}</Text>
                    </View>
                    <ProgressoOrcamento gasto={gasto} orcamento={orcamento}
                        onEditarRenda={() => navigation.getParent<BottomTabNavigationProp<AbasParamList>>()?.navigate('Home', { screen: 'EditarPerfil', initial: false })} />
                </Card>

                <Text style={styles.secao}>Gastos por categoria</Text>
                <Card>
                    {categorias.length === 0 ? (
                        <Text style={styles.vazio}>Nenhum gasto registrado neste mês.</Text>
                    ) : (
                        categorias.map((categoria) => (
                            <View key={categoria.nome} style={styles.categoria}>
                                <View style={styles.categoriaTopo}>
                                    <MarcadorCor cor={corDaCategoria(categoria.nome)} />
                                    <Text style={[styles.categoriaNome, { flex: 1 }]}>{categoria.nome}</Text>
                                    <Text style={styles.categoriaNome}>
                                        {oculto ? 'Valores ocultos' : `${formatarReais(categoria.gasto)} · ${Math.round(categoria.percentual)}%`}
                                    </Text>
                                </View>
                                {!oculto && <View style={styles.trilho}>
                                    <View
                                        style={[
                                            styles.preenchimento,
                                            { backgroundColor: corDaCategoria(categoria.nome), width: `${Math.min(categoria.percentual, 100)}%` },
                                        ]}
                                    />
                                </View>}
                            </View>
                        ))
                    )}
                </Card>
            </Estado>

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
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    orcamento: {
        fontSize: 13,
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
        columnGap: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    vazio: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
    },
    categoriaNome: {
        fontSize: 13,
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
