import { useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { deleteAvatar, getAvatar, mensagemDeErro, uploadAvatar } from '../../../services/api';
import BotaoExcluir from '../../../shared/botaoExcluir';
import Card from '../../../shared/card';
import { useCarregar } from '../../../shared/useCarregar';
import { colors, ui } from '../../../styles/colors';

export default function FotoDePerfil() {
    const foto = useCarregar(getAvatar);
    const [preview, setPreview] = useState<string | null | undefined>();
    const [imagemComErro, setImagemComErro] = useState<string | null>(null);
    const [pendente, setPendente] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [ocupada, setOcupada] = useState(false);
    const [status, setStatus] = useState('');
    const bloqueio = useRef(false);
    const avatar = preview === undefined ? foto.dados : preview;

    async function operar(operacao: () => Promise<void>) {
        if (bloqueio.current) return;
        bloqueio.current = true;
        setOcupada(true);
        setStatus('');
        try {
            await operacao();
        } catch (falha) {
            setStatus(mensagemDeErro(falha));
        } finally {
            bloqueio.current = false;
            setOcupada(false);
        }
    }

    async function enviar(imagem: ImagePicker.ImagePickerAsset) {
        setPendente(imagem);
        setStatus('Enviando foto…');
        const contexto = ImageManipulator.manipulate(imagem.uri);
        try {
            contexto.resize(imagem.width >= imagem.height
                ? { width: Math.min(1024, imagem.width) }
                : { height: Math.min(1024, imagem.height) });
            const render = await contexto.renderAsync();
            try {
                const jpeg = await render.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
                await uploadAvatar(jpeg.uri);
                setPreview(jpeg.uri);
                setImagemComErro(null);
                setPendente(null);
                setStatus('Foto atualizada.');
            } finally {
                render.release();
            }
        } finally {
            contexto.release();
        }
    }

    function escolher(camera: boolean) {
        return operar(async () => {
            if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
                setStatus('A câmera está sem permissão. Escolha uma foto da galeria.');
                return;
            }
            const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] };
            const escolherImagem = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
            const resultado = await escolherImagem(opcoes);
            if (!resultado.canceled) await enviar(resultado.assets[0]);
        });
    }

    function remover() {
        return operar(async () => {
            await deleteAvatar();
            setPreview(null);
            setPendente(null);
            setStatus('Foto removida.');
        });
    }

    return <Card>
        <Text accessibilityRole="header" style={styles.titulo}>Foto de perfil</Text>
        <View style={styles.linha}>
            <View style={styles.avatar}>
                {avatar && imagemComErro !== avatar
                    ? <Image source={{ uri: avatar }} style={styles.imagem} onError={() => setImagemComErro(avatar)} />
                    : <Ionicons name="person-outline" size={32} color={colors.textMuted} />}
            </View>
            <View style={styles.acoes}>
                <Pressable accessibilityRole="button" style={styles.acao} disabled={ocupada} onPress={() => void escolher(false)}>
                    <Text style={styles.link}>Escolher da galeria</Text>
                </Pressable>
                {Platform.OS !== 'web' && <Pressable accessibilityRole="button" style={styles.acao} disabled={ocupada} onPress={() => void escolher(true)}>
                    <Text style={styles.link}>Tirar foto</Text>
                </Pressable>}
            </View>
        </View>
        {(foto.erro || Boolean(avatar && imagemComErro === avatar)) && <Pressable accessibilityRole="button" style={styles.acao} disabled={ocupada} onPress={() => {
            setPreview(undefined);
            setImagemComErro(null);
            void foto.recarregar();
        }}><Text style={styles.link}>Atualizar visualização da foto</Text></Pressable>}
        {status ? <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text> : null}
        {pendente && !ocupada && <Pressable accessibilityRole="button" style={styles.acao} onPress={() => void operar(() => enviar(pendente))}>
            <Text style={styles.link}>Tentar envio novamente</Text>
        </Pressable>}
        {avatar && !ocupada && <BotaoExcluir rotulo="Remover foto" onConfirmar={remover} />}
    </Card>;
}

const styles = StyleSheet.create({
    titulo: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 },
    linha: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    imagem: { width: '100%', height: '100%' },
    acoes: { flex: 1 },
    acao: { minHeight: ui.touch, justifyContent: 'center', alignSelf: 'flex-start' },
    link: { color: colors.primary, fontSize: 15 },
    status: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
});
