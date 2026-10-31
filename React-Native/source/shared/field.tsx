import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../styles/colors';

type FieldProps = TextInputProps & {
    label: string;
    hint?: string;
};

export default function Field({ label, hint, style, ...inputProps }: FieldProps) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={colors.textMuted}
                {...inputProps}
            />
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    hint: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});
