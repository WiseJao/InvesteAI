import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import PasswordStrength from '../../shared/passwordStrength';
import { maskEmail } from '../../shared/format';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EsqueciSenha'>;

export default function EsqueciSenha({ navigation }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [identificador, setIdentificador] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [repetirSenha, setRepetirSenha] = useState('');

    const senhasDiferentes = repetirSenha.length > 0 && novaSenha !== repetirSenha;

    function handleProsseguir() {
        if (step === 1) {
            // TODO: pedir à API o envio do código por e-mail
            return setStep(2);
        }

        if (senhasDiferentes) return;
        // TODO: validar o código e salvar a nova senha na API
        navigation.replace('Login');
    }

    function handleVoltar() {
        if (step === 2) return setStep(1);
        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={handleVoltar}>
                    <Text style={styles.back}>{'< Voltar'}</Text>
                </TouchableOpacity>

                {step === 1 && (
                    <>
                        <Text style={styles.title}>Esqueceu a senha? Tudo bem!</Text>
                        <Text style={styles.subtitle}>
                            Vamos te ajudar a recuperá-la. Nos informe o e-mail ou CPF cadastrado.
                        </Text>
                        <Field
                            label="CPF/E-mail"
                            autoCapitalize="none"
                            value={identificador}
                            onChangeText={setIdentificador}
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.title}>Enviamos um código</Text>
                        <Text style={styles.subtitle}>
                            Enviamos um código para o e-mail {maskEmail(identificador)}. Informe o código abaixo.
                        </Text>
                        <Field
                            label="Código"
                            keyboardType="numeric"
                            value={codigo}
                            onChangeText={setCodigo}
                        />
                        <Field
                            label="Nova senha"
                            secureTextEntry
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                        />
                        <Field
                            label="Repetir nova senha"
                            secureTextEntry
                            value={repetirSenha}
                            onChangeText={setRepetirSenha}
                        />
                        <PasswordStrength password={novaSenha} />
                        {senhasDiferentes && <Text style={styles.error}>As senhas não coincidem.</Text>}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.button, step === 2 && senhasDiferentes && styles.buttonDisabled]}
                    onPress={handleProsseguir}
                >
                    <Text style={styles.buttonText}>Prosseguir</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    back: {
        color: colors.primary,
        fontSize: 13,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 24,
    },
    error: {
        fontSize: 12,
        color: colors.negative,
        marginBottom: 12,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
