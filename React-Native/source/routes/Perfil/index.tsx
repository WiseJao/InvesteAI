import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Layout from '../../shared/layout';
import { getAvatar, uploadAvatar } from '../../services/api';
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
    const [avatar, setAvatar] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const versao = useRef(0);

    useFocusEffect(useCallback(() => {
        let ativo = true;
        const atual = ++versao.current;
        getAvatar().then((imagem) => {
            if (ativo && atual === versao.current) setAvatar(imagem);
        }).catch(() => {
            if (ativo && atual === versao.current) setAvatar(null);
        });
        return () => { ativo = false; };
    }, []));

    async function alterarFoto() {
        if (enviando) return;
        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (resultado.canceled) return;
            const imagem = resultado.assets[0];
            if (!imagem.mimeType || !['image/jpeg', 'image/png'].includes(imagem.mimeType)) {
                Alert.alert('Foto inválida', 'Selecione uma imagem JPEG ou PNG.');
                return;
            }
            if (imagem.fileSize != null && imagem.fileSize > 2 * 1024 * 1024) {
                Alert.alert('Foto muito grande', 'Selecione uma imagem de até 2 MB.');
                return;
            }
            setEnviando(true);
            await uploadAvatar({
                uri: imagem.uri,
                name: imagem.fileName ?? (imagem.mimeType === 'image/png' ? 'avatar.png' : 'avatar.jpg'),
                type: imagem.mimeType,
                webFile: imagem.file,
            });
            ++versao.current;
            setAvatar(await getAvatar());
        } catch {
            Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

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
                <TouchableOpacity style={styles.avatar} onPress={alterarFoto} disabled={enviando}
                    accessibilityRole="button" accessibilityLabel="Alterar foto de perfil">
                    {enviando ? <ActivityIndicator color={colors.primary} /> : avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImagem} onError={() => setAvatar(null)} />
                    ) : <Ionicons name="person" size={56} color={colors.primary} />}
                </TouchableOpacity>
                <Text style={styles.alterarFoto}>Alterar foto</Text>
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
        overflow: 'hidden',
    },
    avatarImagem: {
        width: '100%',
        height: '100%',
    },
    alterarFoto: {
        color: colors.primary,
        fontSize: 12,
        marginTop: 6,
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
