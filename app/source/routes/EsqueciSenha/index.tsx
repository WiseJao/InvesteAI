import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { conteudoTela } from '../../shared/conteudoTela';
import { colors, ui } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EsqueciSenha'>;

export default function EsqueciSenha({ navigation }: Props) {
    const { width } = useWindowDimensions();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={[conteudoTela(width, ui.width.auth), styles.content]} automaticallyAdjustKeyboardInsets>
                <TouchableOpacity accessibilityRole="button" style={{ minHeight: 48 }} onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>Voltar ao login</Text>
                </TouchableOpacity>
                <Text accessibilityRole="header" style={styles.title}>Recuperação de senha indisponível</Text>
                <Text style={styles.subtitle}>
                    A recuperação está indisponível até existir um canal seguro de verificação.
                    Se você ainda tem acesso à conta, pode alterar sua senha em Segurança.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingTop: 24, paddingBottom: 32, gap: ui.space.sm },
    back: { color: colors.primary, fontSize: 13, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
});
