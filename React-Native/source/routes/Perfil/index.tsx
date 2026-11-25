import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import BotaoExcluir from '../../shared/botaoExcluir';
import { useCarregar } from '../../shared/useCarregar';
import { deleteAvatar, getAvatar, mensagemDeErro, logout, uploadAvatar } from '../../services/api';
import { limparUsuario, obterUsuario, type Usuario } from '../../services/usuario';
import { obterCarteira } from '../../services/carteira';
import { listarObjetivos } from '../../services/objetivos';
import { formatarReais } from '../../shared/currency';
import { colors } from '../../styles/colors';
import type { HomeStackParamList } from '../Home/types';
import CabecalhoPesquisa from './components/cabecalhoPesquisa';
import ItemLista from './components/itemLista';

type Item = {
    rotulo: string;
    rota?: 'EditarPerfil' | 'Seguranca' | 'Configuracoes' | 'FAQ';
    sair?: boolean;
};

function formatarCpf(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11
        ? `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
        : cpf;
}

function montarItens(usuario: Usuario | null): Item[] {
    return [
        { rotulo: `Nome: ${usuario?.nome || '—'}` },
        { rotulo: `Email: ${usuario?.email ?? '—'}` },
        { rotulo: `CPF: ${usuario ? formatarCpf(usuario.cpf) : '—'}` },
        { rotulo: 'Editar perfil e renda mensal', rota: 'EditarPerfil' },
        { rotulo: 'Central de segurança', rota: 'Seguranca' },
        { rotulo: 'Central de configurações', rota: 'Configuracoes' },
        { rotulo: 'FAQ', rota: 'FAQ' },
        { rotulo: `Renda mensal: ${usuario?.renda != null ? formatarReais(usuario.renda) : '—'}` },
        { rotulo: 'Sair da conta', sair: true },
    ];
}

async function carregarPerfil() {
    const [usuario, carteira, objetivos] = await Promise.all([obterUsuario(), obterCarteira(), listarObjetivos()]);
    return { usuario, totalInvestimentos: carteira.ativos.length, totalObjetivos: objetivos.length };
}

export default function Perfil() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [fotoPendente, setFotoPendente] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { dados, erro, carregando, recarregar } = useCarregar(carregarPerfil);
    const [erroAvatar, setErroAvatar] = useState(false);
    const versao = useRef(0);
    const usuario = dados?.usuario ?? null;

    useFocusEffect(useCallback(() => {
        let ativo = true;
        setErroAvatar(false);
        const atual = ++versao.current;
        getAvatar().then((imagem) => {
            if (ativo && atual === versao.current) setAvatar(imagem);
        }).catch(() => {
            if (ativo && atual === versao.current) setErroAvatar(true);
        });
        return () => { ativo = false; };
    }, []));

    async function enviarFoto(imagem: ImagePicker.ImagePickerAsset) {
        setEnviando(true);
        setFotoPendente(imagem);
        try {
            const context = ImageManipulator.manipulate(imagem.uri);
            context.resize(imagem.width >= imagem.height ? { width: Math.min(1024, imagem.width) } : { height: Math.min(1024, imagem.height) });
            const rendered = await context.renderAsync();
            try {
                const normalized = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
                if (!normalized.base64 || normalized.base64.length * 3 / 4 > 2 * 1024 * 1024) {
                    throw new Error('A foto processada excede 2 MiB.');
                }
                const webFile = Platform.OS === 'web'
                    ? new File([await (await fetch(normalized.uri)).blob()], 'avatar.jpg', { type: 'image/jpeg' })
                    : undefined;
                await uploadAvatar({ uri: normalized.uri, name: 'avatar.jpg', type: 'image/jpeg', webFile });
            } finally {
                rendered.release();
                context.release();
            }
            ++versao.current;
            setFotoPendente(null);
            setAvatar(await getAvatar());
            setErroAvatar(false);
        } catch (failure) {
            Alert.alert('Foto indisponível', mensagemDeErro(failure));
        } finally {
            setEnviando(false);
        }
    }

    async function alterarFoto(camera = false) {
        if (enviando) return;
        try {
            if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
                Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações do dispositivo.');
                return;
            }
            const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] };
            const result = await (camera ? ImagePicker.launchCameraAsync(options) : ImagePicker.launchImageLibraryAsync(options));
            if (!result.canceled) await enviarFoto(result.assets[0]);
        } catch (failure) {
            Alert.alert('Foto indisponível', mensagemDeErro(failure));
        }
    }

    async function removerFoto() {
        if (enviando) return;
        setEnviando(true);
        try {
            await deleteAvatar();
            ++versao.current;
            setAvatar(null);
            setErroAvatar(false);
        } catch {
            Alert.alert('Erro', 'Não foi possível remover a foto. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

    async function sair() {
        await logout();
        limparUsuario();
    }

    const filtrados = montarItens(usuario).filter((item) =>
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

            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <View style={styles.identidade}>
                    <TouchableOpacity style={styles.avatar} onPress={() => void alterarFoto()} disabled={enviando}
                        accessibilityRole="button" accessibilityLabel="Alterar foto de perfil">
                        {enviando ? <ActivityIndicator color={colors.primary} /> : avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatarImagem} onError={() => setAvatar(null)} />
                        ) : <Ionicons name="person" size={56} color={colors.primary} />}
                    </TouchableOpacity>
                    <Text style={styles.alterarFoto}>Escolher foto</Text>
                    {Platform.OS !== 'web' && <TouchableOpacity accessibilityRole="button" disabled={enviando} onPress={() => void alterarFoto(true)}><Text style={styles.alterarFoto}>Tirar foto</Text></TouchableOpacity>}
                    {fotoPendente && !enviando && <TouchableOpacity accessibilityRole="button" onPress={() => void enviarFoto(fotoPendente)}><Text style={styles.alterarFoto}>Tentar envio novamente</Text></TouchableOpacity>}
                    {avatar && !enviando ? <BotaoExcluir rotulo="Remover foto" onConfirmar={removerFoto} /> : null}
                    <Text style={styles.nome}>{usuario?.nome ?? '—'}</Text>
                    {erroAvatar ? <Text style={styles.alterarFoto}>Foto indisponível.</Text> : null}
                    <View style={styles.contadores}>
                        <View style={styles.contador}>
                            <Text style={styles.contadorValor}>{dados?.totalInvestimentos ?? '—'}</Text>
                            <Text style={styles.contadorRotulo}>investimentos</Text>
                        </View>
                        <View style={styles.divisor} />
                        <View style={styles.contador}>
                            <Text style={styles.contadorValor}>{dados?.totalObjetivos ?? '—'}</Text>
                            <Text style={styles.contadorRotulo}>objetivos</Text>
                        </View>
                    </View>
                </View>

            </Estado>
            {filtrados.map((item) => (
                <ItemLista
                    key={item.rotulo}
                    rotulo={item.rotulo}
                    onPress={item.sair ? sair : item.rota ? () => navigation.navigate(item.rota!) : undefined}
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
