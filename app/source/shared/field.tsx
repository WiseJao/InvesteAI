import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, ui } from '../styles/colors';
import { usePrivacidade } from './privacidade';

type FieldProps = TextInputProps & {
    label: string;
    hint?: string;
    financeiro?: boolean;
    erro?: string;
    acao?: { rotulo: string; icone: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void };
    ref?: React.Ref<React.ComponentRef<typeof TextInput>>;
};

export default function Field({ label, hint, erro, acao, style, financeiro = false, onFocus, onBlur, ...inputProps }: FieldProps) {
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
            ) : <View style={styles.linha}>
              <TextInput
                style={[styles.input, erro ? styles.invalido : null, focado && styles.foco, acao && styles.comAcao, style]}
                onFocus={event => { setFocado(true); onFocus?.(event); }}
                onBlur={event => { setFocado(false); onBlur?.(event); }}
                accessibilityLabel={label}
                placeholderTextColor={colors.textMuted}
                {...inputProps}
              />
              {acao && <Pressable accessibilityRole="button" accessibilityLabel={acao.rotulo} onPress={acao.onPress} style={styles.acao}>
                <Ionicons name={acao.icone} size={22} color={colors.primary} />
              </Pressable>}
            </View>}
            {erro ? <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text> : null}
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { gap: ui.space.xs },
    label: {
        fontSize: ui.font.label,
        color: colors.textMuted,
    },
    linha: { justifyContent: 'center' },
    comAcao: { paddingRight: 56 },
    acao: { position: 'absolute', right: 0, minHeight: ui.touch, minWidth: ui.touch, justifyContent: 'center', alignItems: 'center' },
    revelar: { color: colors.primary },
    foco: { outlineColor: colors.primary, outlineWidth: 2 },
    invalido: { borderColor: colors.negative },
    erro: { color: colors.negative, fontSize: ui.font.label },
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
        fontSize: ui.font.label,
        color: colors.textMuted,
    },
});
