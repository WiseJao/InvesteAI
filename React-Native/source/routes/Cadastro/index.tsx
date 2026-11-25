import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import PasswordStrength from '../../shared/passwordStrength';
import { cpfValido, formatCPF } from '../../shared/format';
import { lerDecimal } from '../../shared/currency';
import { colors } from '../../styles/colors';
import { registerUnified } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

type Step = 1 | 2 | 3;

type FormData = {
    nome: string;
    sobrenome: string;
    comoOuviu: string;
    email: string;
    nomeExibicao: string;
    corFavorita: string;
    usoPretendido: string;
    emprego: string;
    renda: string;
    datasRecebimento: string;
    interesseBancos: string;
    bancosAtuais: string;
    cpf: string;
    senha: string;
    repetirSenha: string;
};

const initialData: FormData = {
    nome: '',
    sobrenome: '',
    comoOuviu: '',
    email: '',
    nomeExibicao: '',
    corFavorita: '',
    usoPretendido: '',
    emprego: '',
    renda: '',
    datasRecebimento: '',
    interesseBancos: '',
    bancosAtuais: '',
    cpf: '',
    senha: '',
    repetirSenha: '',
};

export default function Cadastro({ navigation }: Props) {
    const [step, setStep] = useState<Step>(1);
    const [data, setData] = useState<FormData>(initialData);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function update<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData((atual) => ({ ...atual, [key]: value }));
    }

    const senhasDiferentes = data.repetirSenha.length > 0 && data.senha !== data.repetirSenha;

    async function handleProsseguir() {
        setErrorMsg(null);
        if (step === 1) {
            const nome = `${data.nome.trim()} ${data.sobrenome.trim()}`.trim();
            if (!nome || nome.length > 255) return setErrorMsg('Informe um nome completo de até 255 caracteres.');
            if (!data.email.trim() || data.email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return setErrorMsg('Informe um e-mail válido de até 255 caracteres.');
            if (Array.from(data.nomeExibicao).length > 255) return setErrorMsg('O nome de exibição deve ter até 255 caracteres.');
            return setStep(2);
        }
        if (step === 2) {
            if (data.renda.trim() && lerDecimal(data.renda, 17, 2) === null) return setErrorMsg('Informe uma renda não negativa com até 17 dígitos inteiros e 2 casas decimais.');
            return setStep(3);
        }

        if (!cpfValido(data.cpf)) return setErrorMsg('Informe um CPF válido.');
        if (!data.senha.trim()) return setErrorMsg('Informe uma senha.');

        if (senhasDiferentes || loading) return;

        try {
            setLoading(true);
            setErrorMsg(null);
            await registerUnified(data);
            navigation.replace('Main');
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    }

    function handleVoltar() {
        if (step === 1) return navigation.goBack();
        setStep((atual) => (atual - 1) as Step);
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={handleVoltar}>
                    <Text style={styles.back}>{'< Voltar'}</Text>
                </TouchableOpacity>

                {step === 1 && (
                    <>
                        <Text style={styles.title}>Se cadastre, é grátis!</Text>
                        <Text style={styles.section}>Informações básicas</Text>
                        <Field label="Nome" value={data.nome} onChangeText={(v) => update('nome', v)} />
                        <Field
                            label="Sobrenome"
                            value={data.sobrenome}
                            onChangeText={(v) => update('sobrenome', v)}
                        />
                        <Field
                            label="Como ouviu falar da gente?"
                            value={data.comoOuviu}
                            onChangeText={(v) => update('comoOuviu', v)}
                        />
                        <Field
                            label="E-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={data.email}
                            onChangeText={(v) => update('email', v)}
                        />

                        <Text style={styles.section}>Customização (opcional)</Text>
                        <Field
                            label="Nome de exibição"
                            value={data.nomeExibicao}
                            onChangeText={(v) => update('nomeExibicao', v)}
                        />
                        <Field
                            label="Cor favorita"
                            value={data.corFavorita}
                            onChangeText={(v) => update('corFavorita', v)}
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.title}>Agora nos diga um pouco sobre você</Text>
                        <Field
                            label="Como pretende usar o InvesteAI?"
                            value={data.usoPretendido}
                            onChangeText={(v) => update('usoPretendido', v)}
                        />
                        <Field
                            label="Qual seu emprego atual?"
                            value={data.emprego}
                            onChangeText={(v) => update('emprego', v)}
                        />
                        <Field
                            label="Sua renda"
                            keyboardType="decimal-pad"
                            value={data.renda}
                            onChangeText={(v) => update('renda', v)}
                        />
                        <Field
                            label="Em que datas você recebe?"
                            hint="O InvesteAI utiliza essas informações para automatizar seu dia a dia."
                            value={data.datasRecebimento}
                            onChangeText={(v) => update('datasRecebimento', v)}
                        />

                        <Text style={styles.note}>
                            Atualmente o InvesteAI é uma ferramenta experimental, gostaríamos de entender o
                            público! (Opcional)
                        </Text>
                        <Field
                            label="Estaria interessado em no futuro conectar bancos ao aplicativo?"
                            value={data.interesseBancos}
                            onChangeText={(v) => update('interesseBancos', v)}
                        />
                        <Field
                            label="Quais bancos atualmente está usando?"
                            value={data.bancosAtuais}
                            onChangeText={(v) => update('bancosAtuais', v)}
                        />
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.title}>Estamos quase lá</Text>
                        <Text style={styles.section}>Informações para login</Text>
                        <Field
                            label="CPF"
                            placeholder="000.000.000-00"
                            keyboardType="numeric"
                            value={data.cpf}
                            onChangeText={(v) => update('cpf', formatCPF(v))}
                        />
                        <Field
                            label="Senha"
                            secureTextEntry
                            value={data.senha}
                            onChangeText={(v) => update('senha', v)}
                        />
                        <Field
                            label="Repetir senha"
                            secureTextEntry
                            value={data.repetirSenha}
                            onChangeText={(v) => update('repetirSenha', v)}
                        />
                        <PasswordStrength password={data.senha} />
                        {senhasDiferentes && <Text style={styles.error}>As senhas não coincidem.</Text>}
                    </>
                )}

                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
                <TouchableOpacity
                    style={[styles.button, (step === 3 && (senhasDiferentes || loading)) && styles.buttonDisabled]}
                    onPress={handleProsseguir}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                        <Text style={styles.buttonText}>{step === 3 ? 'Criar conta' : 'Prosseguir'}</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.stepIndicator}>{step}/3</Text>
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
        marginBottom: 12,
    },
    section: {
        fontSize: 13,
        color: colors.primary,
        marginBottom: 12,
        marginTop: 4,
    },
    note: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 12,
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
    stepIndicator: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 16,
    },
});
