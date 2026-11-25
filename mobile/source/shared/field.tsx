import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, ui } from '../styles/colors';
import { usePrivacidade } from './privacidade';

type FieldProps = TextInputProps & {
    label: string;
    hint?: string;
    financeiro?: boolean;
    erro?: string;
    ref?: React.Ref<React.ComponentRef<typeof TextInput>>;
};

export default function Field({ label, hint, erro, style, financeiro = false, onFocus, onBlur, ...inputProps }: FieldProps) {
    const { oculto } = usePrivacidade();
    const [focado, setFocado] = useState(false);
    const [revelado, setRevelado] = useState(false);
    useFocusEffect(useCallback(() => () => setRevelado(false), []));
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            {financeiro && oculto && !revelado ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Mostrar ${label} nesta edição`} style={styles.input} onPress={() => setRevelado(true)}>
                    <Text style={styles.revelar}>Mostrar valor nesta edição</Text>
                </Pressable>
            ) : <TextInput
                style={[styles.input, erro ? styles.invalido : null, focado && styles.foco, style]}
                onFocus={event => { setFocado(true); onFocus?.(event); }}
                onBlur={event => { setFocado(false); onBlur?.(event); }}
                accessibilityLabel={label}
                placeholderTextColor={colors.textMuted}
                {...inputProps}
            />}
            {erro ? <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text> : null}
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: ui.font.label,
        color: colors.textMuted,
        marginBottom: 6,
    },
    revelar: { color: colors.primary },
    foco: { outlineColor: colors.primary, outlineWidth: 2 },
    invalido: { borderColor: colors.negative },
    erro: { color: colors.negative, fontSize: 12, marginTop: 4 },
    input: {
        minHeight: ui.touch,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.controlBorder,
        borderRadius: ui.radius,
        paddingHorizontal: 14,
        paddingVertical: ui.fieldPadding,
        fontSize: ui.font.body,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    hint: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});
