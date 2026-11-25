import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import { cpfValido } from '../../shared/format';
import { ApiError, login, mensagemDeErro } from '../../services/api';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const enviando = useRef(false);
    const entradaSenha = useRef<import('react').ComponentRef<typeof TextInput>>(null);
    const entradaIdentificador = useRef<import('react').ComponentRef<typeof TextInput>>(null);
    const [erro, setErro] = useState<string | null>(null);

    async function handleEntrar() {
        if (enviando.current) return;
        const valor = identificador.trim();
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
        const cpf = /^[0-9.-]+$/.test(valor) && cpfValido(valor);

        if ((!email && !cpf) || !senha) {
            setErro('Informe um CPF ou e-mail válido e a senha.');
            (email || cpf ? entradaSenha : entradaIdentificador).current?.focus();
            return;
        }

        enviando.current = true;
        setCarregando(true);
        setErro(null);

        try {
            await login(cpf ? valor.replace(/\D/g, '') : valor, senha);
            navigation.replace('Main');
        } catch (erroLogin) {
            setErro(erroLogin instanceof ApiError && [400, 401, 403].includes(erroLogin.status)
                ? 'CPF, e-mail ou senha incorretos.' : mensagemDeErro(erroLogin));
        } finally {
            enviando.current = false;
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.logoArea}>
                        <Text style={styles.logo}>InvesteAI</Text>
                    </View>

                    <View style={styles.form}>
                        <Field
                            label="CPF ou e-mail"
                            ref={entradaIdentificador}
                            autoComplete="username"
                            returnKeyType="next"
                            onSubmitEditing={() => entradaSenha.current?.focus()}
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
                            ref={entradaSenha}
                            autoComplete="current-password"
                            returnKeyType="go"
                            onSubmitEditing={handleEntrar}
                            secureTextEntry={!mostrarSenha}
                            value={senha}
                            onChangeText={setSenha}
                        />

                        <TouchableOpacity accessibilityRole="button" style={styles.acao} onPress={() => setMostrarSenha(v => !v)}>
                            <Text style={styles.link}>{mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" style={styles.acao} onPress={() => navigation.navigate('EsqueciSenha')}>
                            <Text style={styles.link}>Esqueci minha senha</Text>
                        </TouchableOpacity>

                        {erro && <Text accessibilityLiveRegion="polite" style={styles.error}>{erro}</Text>}

                        <TouchableOpacity
                            style={[styles.button, carregando && styles.buttonDisabled]}
                            onPress={handleEntrar}
                            disabled={carregando}
                            accessibilityRole="button"
                            accessibilityLabel="Entrar"
                            accessibilityState={{ disabled: carregando, busy: carregando }}
                        >
                            {carregando ? (
                                <ActivityIndicator color={colors.onPrimary} />
                            ) : (
                                <Text style={styles.buttonText}>Entrar</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity accessibilityRole="button" style={styles.acao} onPress={() => navigation.navigate('Cadastro')}>
                            <Text style={styles.newUser}>Sou novo no InvesteAI</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    acao: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
    link: {
        color: colors.primary,
        fontSize: 13,
        textAlign: 'left',

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
