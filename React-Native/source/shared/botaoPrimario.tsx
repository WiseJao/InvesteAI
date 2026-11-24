import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';

type BotaoPrimarioProps = {
    titulo: string;
    onPress: () => void;
    carregando?: boolean;
    desabilitado?: boolean;
};

export default function BotaoPrimario({ titulo, onPress, carregando = false, desabilitado = false }: BotaoPrimarioProps) {
    const inativo = carregando || desabilitado;

    return (
        <TouchableOpacity
            style={[styles.botao, inativo && styles.inativo]}
            onPress={onPress}
            disabled={inativo}
            activeOpacity={0.8}
        >
            {carregando ? (
                <ActivityIndicator color={colors.onPrimary} />
            ) : (
                <Text style={styles.texto}>{titulo}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botao: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    inativo: {
        opacity: 0.5,
    },
    texto: {
        color: colors.onPrimary,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
