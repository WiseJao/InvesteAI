import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import { colors } from '../../styles/colors';
import Botao from './components/botao';
import type { AIStackParamList } from './types';

export default function AI() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();

    return (
        <Layout titulo="Acessoria">
            <Card rotulo="ANÁLISE DE PERFIL">
                <Text style={styles.texto}>
                    Responda um questionário rápido e descubra qual perfil de investidor combina com
                    você.
                </Text>
                {/* TODO: abrir o questionário de perfil quando a tela existir */}
                <Botao titulo="Iniciar análise" />
            </Card>

            <Card rotulo="SEU PERFIL ATUAL" onPress={() => navigation.navigate('PerfilInvestidor')}>
                <Text style={styles.destaque}>Moderado</Text>
                <Text style={styles.apoio}>Toque para ver detalhes do seu perfil</Text>
            </Card>

            <Card rotulo="CHATBOT">
                <Text style={styles.texto}>Converse com a IA sobre suas dúvidas de investimento.</Text>
                <Text style={styles.exemplo}>
                    “Qual o melhor investimento para reserva de emergência?”
                </Text>
                {/* TODO: abrir o chat quando a tela existir */}
                <Botao titulo="Abrir chat" />
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
    exemplo: {
        fontSize: 11,
        fontStyle: 'italic',
        color: colors.textMuted,
        marginTop: 8,
    },
});
