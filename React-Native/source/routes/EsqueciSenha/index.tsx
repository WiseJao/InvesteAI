import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import PasswordStrength from '../../shared/passwordStrength';
import BotaoPrimario from '../../shared/botaoPrimario';
import { maskEmail } from '../../shared/format';
import { mensagemDeErro } from '../../services/api';
import { redefinirSenha, solicitarCodigo } from '../../services/senha';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EsqueciSenha'>;

export default function EsqueciSenha({ navigation }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [identificador, setIdentificador] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [repetirSenha, setRepetirSenha] = useState('');

    const [codigoDemo, setCodigoDemo] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const senhasDiferentes = repetirSenha.length > 0 && novaSenha !== repetirSenha;

    function traduzirErro(e: unknown): string {
        const texto = mensagemDeErro(e);
        if (texto.includes('HTTP 400')) {
            return step === 1
                ? 'Confira o CPF ou e-mail informado e tente novamente.'
                : 'Código incorreto ou expirado. Confira e tente novamente.';
        }
        return texto;
    }

    async function handleProsseguir() {
        setErro(null);

        if (step === 1) {
            if (!identificador.trim()) return setErro('Informe o CPF ou o e-mail cadastrado.');
            setCarregando(true);
            try {
                setCodigoDemo(await solicitarCodigo(identificador));
                setStep(2);
            } catch (e) {
                setErro(traduzirErro(e));
            } finally {
                setCarregando(false);
            }
            return;
        }

        if (!codigo.trim()) return setErro('Informe o código recebido.');
        if (!novaSenha) return setErro('Informe a nova senha.');
        if (senhasDiferentes || !repetirSenha) return setErro('As senhas não coincidem.');

        setCarregando(true);
        try {
            await redefinirSenha(identificador, codigo, novaSenha);
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
        } catch (e) {
            setErro(traduzirErro(e));
        } finally {
            setCarregando(false);
        }
    }

    function handleVoltar() {
        setErro(null);
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
                        <Text style={styles.title}>Informe o código</Text>
                        <Text style={styles.subtitle}>
                            {identificador.includes('@')
                                ? `Se existir uma conta para ${maskEmail(identificador)}, geramos um código.`
                                : 'Se existir uma conta com esse CPF, geramos um código.'}{' '}
                            Informe-o abaixo e escolha a nova senha.
                        </Text>
                        {codigoDemo ? (
                            <Text style={styles.dica}>Código para esta demonstração: {codigoDemo}</Text>
                        ) : null}
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

                {erro ? <Text style={styles.error}>{erro}</Text> : null}

                <BotaoPrimario titulo="Prosseguir" onPress={handleProsseguir} carregando={carregando} />
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
    dica: {
        fontSize: 13,
        color: colors.primary,
        marginBottom: 16,
    },
});
