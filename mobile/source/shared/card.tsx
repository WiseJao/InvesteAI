import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, ui } from '../styles/colors';

type CardProps = {
    rotulo?: string;
    onPress?: () => void;
    children: ReactNode;
};

export default function Card({ rotulo, onPress, children }: CardProps) {
    const conteudo = (
        <>
            {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
            {children}
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button" activeOpacity={0.7}>
                {conteudo}
            </TouchableOpacity>
        );
    }

    return <View style={styles.card}>{conteudo}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius,
        padding: 16,
        marginBottom: 12,
    },
    rotulo: {
        fontSize: 10,
        letterSpacing: 0.5,
        color: colors.textMuted,
        marginBottom: 8,
    },
});
