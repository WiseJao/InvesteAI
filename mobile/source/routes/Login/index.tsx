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
import { cpfValido } from '../../shared/format';
import { login } from '../../services/api';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function handleEntrar() {
        const valor = identificador.trim();
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
        const cpf = /^[0-9.-]+$/.test(valor) && cpfValido(valor);

        if ((!email && !cpf) || !senha) {
            setErro('Informe um CPF ou e-mail válido e a senha.');
            return;
        }

        setCarregando(true);
        setErro(null);

        try {
            await login(cpf ? valor.replace(/\D/g, '') : valor, senha);
            navigation.replace('Main');
        } catch (erroLogin) {
            const mensagem = erroLogin instanceof Error ? erroLogin.message : '';

            if (/network|fetch|failed to connect/i.test(mensagem)) {
                setErro('Não foi possível conectar ao servidor. Tente novamente.');
            } else if (mensagem && !mensagem.startsWith('HTTP ')) {
                setErro(mensagem);
            } else {
                setErro('CPF, e-mail ou senha incorretos.');
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
                        label="CPF ou e-mail"
                        placeholder="Digite seu CPF ou e-mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={identificador}
                        onChangeText={setIdentificador}
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
});
