import { Text, StyleSheet } from 'react-native';
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

export default function AI() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
    const { dados: perfil, carregando, erro, recarregar } = useCarregar(obterPerfilInvestidor);

    return (
        <Layout titulo="Acessoria">
            <Card rotulo="ANÁLISE DE PERFIL">
                <Text style={styles.texto}>
                    Responda um questionário rápido e descubra qual perfil de investidor combina com
                    você.
                </Text>
                <Botao titulo="Iniciar análise" onPress={() => navigation.navigate('Questionario')} />
            </Card>

            <Estado carregando={carregando} erro={erro} temDados={perfil !== null} onTentarNovamente={recarregar}>
                <Card rotulo="SEU PERFIL ATUAL" onPress={() => navigation.navigate('PerfilInvestidor')}>
                    <Text style={styles.destaque}>{perfil?.perfil}</Text>
                    <Text style={styles.apoio}>Toque para ver detalhes do seu perfil</Text>
                </Card>
            </Estado>

            <Card rotulo="CHATBOT">
                <Text style={styles.texto}>Converse com a IA sobre suas dúvidas de investimento.</Text>
                <Text style={styles.exemplo}>
                    “Qual o melhor investimento para reserva de emergência?”
                </Text>
                <Text style={styles.emBreve}>Em breve</Text>
            </Card>
        </Layout>
    );
}

const styles = StyleSheet.create({
    texto: {
        fontSize: 13,
        color: colors.text,
    },
    destaque: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    apoio: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
    emBreve: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 12,
    },
    exemplo: {
        fontSize: 11,
        fontStyle: 'italic',
        color: colors.textMuted,
        marginTop: 8,
    },
});
