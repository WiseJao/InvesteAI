import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EsqueciSenha'>;

export default function EsqueciSenha({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>{'< Voltar'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Recuperação de senha indisponível</Text>
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
    content: { padding: 24, paddingBottom: 40 },
    back: { color: colors.primary, fontSize: 13, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
});
