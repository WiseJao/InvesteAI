import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import { colors } from '../../styles/colors';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { obterPerfilInvestidor } from '../../services/assessoria';
import Botao from './components/botao';
import type { AIStackParamList } from './types';

export default function PerfilInvestidor() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
    const { dados: perfil, carregando, erro, recarregar } = useCarregar(obterPerfilInvestidor);

    return (
        <Layout titulo="Perfil de investidor" voltar>
            <Estado carregando={carregando} erro={erro} temDados={perfil !== null} onTentarNovamente={recarregar}>
                <Card rotulo="SEU PERFIL">
                    <Text style={styles.destaque}>{perfil?.perfil}</Text>
                    <Text style={styles.texto}>{perfil?.resumo}</Text>
                </Card>

                <Card rotulo="TOLERÂNCIA A RISCO">
                    <Text style={styles.valor}>{perfil?.tolerancia}</Text>
                </Card>

                <Card rotulo="OBJETIVOS INFORMADOS">
                    {(perfil?.objetivos ?? []).map((objetivo) => (
                        <Text key={objetivo} style={styles.texto}>
                            {'•'} {objetivo}
                        </Text>
                    ))}
                </Card>

                <Card rotulo="ALOCAÇÃO SUGERIDA">
                    {(perfil?.alocacao ?? []).map((item) => (
                        <View key={item.nome} style={styles.linha}>
                            <Text style={styles.texto}>{item.nome}</Text>
                            <Text style={styles.valor}>{item.percentual}%</Text>
                        </View>
                    ))}
                </Card>

                <Botao titulo="Ver recomendações" onPress={() => navigation.navigate('Recomendacoes')} />
            </Estado>
        </Layout>
    );
}

const styles = StyleSheet.create({
    destaque: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },
    texto: {
        fontSize: 12,
        color: colors.text,
        lineHeight: 18,
    },
    valor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
});
