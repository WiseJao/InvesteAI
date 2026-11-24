import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import { formatCPF } from '../../shared/format';
import { login } from '../../services/api';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [biometria, setBiometria] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function handleEntrar() {
        const cpfNumeros = cpf.replace(/\D/g, '');

        if (cpfNumeros.length !== 11 || !senha) {
            setErro('Informe o CPF completo e a senha.');
            return;
        }

        setCarregando(true);
        setErro(null);

        try {
            await login(cpfNumeros, senha);
            navigation.replace('Main');
        } catch (erroLogin) {
            const mensagem = erroLogin instanceof Error ? erroLogin.message : '';

            if (/network|fetch|failed to connect/i.test(mensagem)) {
                setErro('Não foi possível conectar ao servidor. Tente novamente.');
            } else if (mensagem && !mensagem.startsWith('HTTP ')) {
                setErro(mensagem);
            } else {
                setErro('CPF ou senha incorretos.');
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.logoArea}>
                    <Text style={styles.logo}>InvesteAI</Text>
                </View>

                <View style={styles.form}>
                    <Field
                        label="CPF"
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        maxLength={14}
                        value={cpf}
                        onChangeText={(value) => setCpf(formatCPF(value))}
                    />
                    <Field
                        label="Senha"
                        placeholder="Sua senha"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />

                    <TouchableOpacity onPress={() => navigation.navigate('EsqueciSenha')}>
                        <Text style={styles.link}>Esqueci minha senha</Text>
                    </TouchableOpacity>

                    {erro && <Text style={styles.error}>{erro}</Text>}

                    <TouchableOpacity
                        style={[styles.button, carregando && styles.buttonDisabled]}
                        onPress={handleEntrar}
                        disabled={carregando}
                    >
                        {carregando ? (
                            <ActivityIndicator color={colors.onPrimary} />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                        <Text style={styles.newUser}>Sou novo no InvesteAI</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.biometriaRow}
                    onPress={() => setBiometria((atual) => !atual)}
                >
                    <View style={[styles.checkbox, biometria && styles.checkboxChecked]} />
                    <Text style={styles.biometriaText}>Logar com biometria</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    logoArea: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
    },
    form: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    link: {
        color: colors.primary,
        fontSize: 13,
        textAlign: 'left',
        marginBottom: 24,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    error: {
        color: colors.negative,
        fontSize: 12,
        marginBottom: 12,
    },
    buttonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    newUser: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 24,
    },
    biometriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    biometriaText: {
        color: colors.textMuted,
        fontSize: 12,
    },
});
