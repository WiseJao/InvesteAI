import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { getPasswordStrength } from './format';

type PasswordStrengthProps = {
    password: string;
};

const levelColors = [colors.border, colors.negative, colors.warning, colors.primary, colors.positive];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    const { level, label } = getPasswordStrength(password);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>
                Segurança da senha{label ? `: ${label}` : ''}
            </Text>
            <View style={styles.bars}>
                {[1, 2, 3, 4].map((position) => (
                    <View
                        key={position}
                        style={[
                            styles.bar,
                            { backgroundColor: position <= level ? levelColors[level] : colors.border },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: -8,
        marginBottom: 16,
    },
    label: {
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 6,
    },
    bars: {
        flexDirection: 'row',
        gap: 6,
    },
    bar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
});
