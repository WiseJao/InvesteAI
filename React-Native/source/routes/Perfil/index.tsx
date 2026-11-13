import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import { colors } from '../../styles/colors';
import type { HomeStackParamList } from '../Home/types';
import CabecalhoPesquisa from './components/cabecalhoPesquisa';
import ItemLista from './components/itemLista';

type Item = {
    rotulo: string;
    rota?: 'Seguranca' | 'Configuracoes' | 'FAQ';
};

// TODO: substituir pelos dados do usuário vindos da API
const itens: Item[] = [
    { rotulo: 'Email: email@gmail.com' },
    { rotulo: 'CPF: 000.000.000-00' },
    { rotulo: 'Número: 00-00000-0000' },
    { rotulo: 'Central de segurança', rota: 'Seguranca' },
    { rotulo: 'Central de configurações', rota: 'Configuracoes' },
    { rotulo: 'FAQ', rota: 'FAQ' },
    { rotulo: 'Renda mensal: R$ 4.000' },
];

export default function Perfil() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');

    const filtrados = itens.filter((item) =>
        item.rotulo.toLowerCase().includes(termo.trim().toLowerCase()),
    );

    function alternarPesquisa() {
        setAberto((atual) => !atual);
        setTermo('');
    }

    return (
        <Layout comHeader={false} voltar>
            <CabecalhoPesquisa
                titulo="Perfil"
                aberto={aberto}
                termo={termo}
                onAlternar={alternarPesquisa}
                onChangeTermo={setTermo}
            />

            <View style={styles.identidade}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={56} color={colors.primary} />
                </View>
                <Text style={styles.nome}>Nome Sobrenome</Text>
                <View style={styles.contadores}>
                    <View style={styles.contador}>
                        <Text style={styles.contadorValor}>0</Text>
                        <Text style={styles.contadorRotulo}>investimentos</Text>
                    </View>
                    <View style={styles.divisor} />
                    <View style={styles.contador}>
                        <Text style={styles.contadorValor}>0</Text>
                        <Text style={styles.contadorRotulo}>objetivos</Text>
                    </View>
                </View>
            </View>

            {filtrados.map((item) => (
                <ItemLista
                    key={item.rotulo}
                    rotulo={item.rotulo}
                    onPress={item.rota ? () => navigation.navigate(item.rota!) : undefined}
                />
            ))}
        </Layout>
    );
}

const styles = StyleSheet.create({
    identidade: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nome: {
        fontSize: 16,
        color: colors.text,
        marginTop: 10,
    },
    contadores: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    contador: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    contadorValor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    contadorRotulo: {
        fontSize: 10,
        color: colors.textMuted,
    },
    divisor: {
        width: 1,
        height: 28,
        backgroundColor: colors.border,
    },
});
