import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../shared/card';
import { colors } from '../../styles/colors';

// TODO: substituir pelos objetivos do usuário vindos da API
export default function Objetivos() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.topo}>
                <TouchableOpacity
                    style={styles.botaoFechar}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Fechar"
                >
                    <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.titulo}>Objetivos</Text>
                <TouchableOpacity
                    style={styles.botaoConfirmar}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Confirmar"
                >
                    <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.conteudo}>
                <Card rotulo="INVESTIMENTOS">
                    <Text style={styles.texto}>1. R$ 999,99</Text>
                    <Text style={styles.apoio}>1.700 / 100.000 investidos</Text>
                </Card>
                <Card rotulo="GASTOS">
                    <Text style={styles.texto}>1. Reduzir gastos com comida</Text>
                </Card>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    botaoFechar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoConfirmar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conteudo: {
        paddingHorizontal: 20,
    },
    texto: {
        fontSize: 14,
        color: colors.text,
    },
    apoio: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});
