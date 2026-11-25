import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, ui } from '../styles/colors';

type BotaoPrimarioProps = {
    titulo: string;
    onPress: () => void;
    carregando?: boolean;
    desabilitado?: boolean;
};

export default function BotaoPrimario({ titulo, onPress, carregando = false, desabilitado = false }: BotaoPrimarioProps) {
    const [focado, setFocado] = useState(false);
    const inativo = carregando || desabilitado;

    return (
        <TouchableOpacity
            style={[styles.botao, inativo && styles.inativo, focado && styles.foco]}
            onFocus={() => setFocado(true)}
            onBlur={() => setFocado(false)}
            onPress={onPress}
            disabled={inativo}
            accessibilityRole="button"
            accessibilityLabel={titulo}
            accessibilityState={{ disabled: inativo, busy: carregando }}
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
        borderRadius: ui.radius,
        paddingVertical: 14,
        minHeight: ui.touch,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ui.space.lg,
    },
    foco: { outlineColor: colors.primary, outlineWidth: 2, outlineOffset: 3 },
    inativo: {
        opacity: 0.5,
    },
    texto: {
        color: colors.onPrimary,
        fontSize: ui.font.body,
        fontWeight: 'bold',
    },
});
