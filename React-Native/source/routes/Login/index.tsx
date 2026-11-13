import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import { formatCPF } from '../../shared/format';
import { colors } from '../../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [biometria, setBiometria] = useState(false);

    function handleEntrar() {
        // TODO: autenticar com a API (CPF + senha)
        navigation.replace('Main');
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

                    <TouchableOpacity style={styles.button} onPress={handleEntrar}>
                        <Text style={styles.buttonText}>Entrar</Text>
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
