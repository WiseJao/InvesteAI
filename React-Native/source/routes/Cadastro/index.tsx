import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Field from '../../shared/field';
import PasswordStrength from '../../shared/passwordStrength';
import { formatCPF } from '../../shared/format';
import { colors } from '../../styles/colors';

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

    function update<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData((atual) => ({ ...atual, [key]: value }));
    }

    const senhasDiferentes = data.repetirSenha.length > 0 && data.senha !== data.repetirSenha;

    function handleProsseguir() {
        if (step === 1) return setStep(2);
        if (step === 2) return setStep(3);

        if (senhasDiferentes) return;
        // TODO: enviar o cadastro para a API e confirmar o e-mail
        navigation.replace('Main');
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
                            keyboardType="numeric"
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
                            maxLength={14}
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

                <TouchableOpacity
                    style={[styles.button, step === 3 && senhasDiferentes && styles.buttonDisabled]}
                    onPress={handleProsseguir}
                >
                    <Text style={styles.buttonText}>{step === 3 ? 'Confirmar e-mail' : 'Prosseguir'}</Text>
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
