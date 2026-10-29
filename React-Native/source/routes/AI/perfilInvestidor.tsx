import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import { colors } from '../../styles/colors';
import Botao from './components/botao';
import type { AIStackParamList } from './types';

// TODO: substituir pelos dados da API quando o backend estiver pronto
const objetivos = [
    'Aposentadoria (longo prazo)',
    'Reserva de emergência',
    'Compra de imóvel (médio prazo)',
];

const alocacao = [
    { nome: 'Renda fixa', percentual: 45 },
    { nome: 'Ações', percentual: 35 },
    { nome: 'Fundos imobiliários', percentual: 15 },
    { nome: 'Reserva/Caixa', percentual: 5 },
];

export default function PerfilInvestidor() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();

    return (
        <Layout titulo="Perfil de investidor" voltar>
            <Card rotulo="SEU PERFIL">
                <Text style={styles.destaque}>Moderado</Text>
                <Text style={styles.texto}>
                    Você busca equilíbrio entre segurança e rentabilidade, aceitando alguma variação
                    para obter retornos melhores que a renda fixa pura.
                </Text>
            </Card>

            <Card rotulo="TOLERÂNCIA A RISCO">
                <Text style={styles.valor}>Média</Text>
            </Card>

            <Card rotulo="OBJETIVOS INFORMADOS">
                {objetivos.map((objetivo) => (
                    <Text key={objetivo} style={styles.texto}>
                        {'•'} {objetivo}
                    </Text>
                ))}
            </Card>

            <Card rotulo="ALOCAÇÃO SUGERIDA">
                {alocacao.map((item) => (
                    <View key={item.nome} style={styles.linha}>
                        <Text style={styles.texto}>{item.nome}</Text>
                        <Text style={styles.valor}>{item.percentual}%</Text>
                    </View>
                ))}
            </Card>

            <Botao titulo="Ver recomendações" onPress={() => navigation.navigate('Recomendacoes')} />
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
