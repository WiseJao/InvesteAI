import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, ui } from '../styles/colors';
import { nomeParaExibir, obterUsuario } from '../services/usuario';
import { conteudoTela } from './conteudoTela';
import { usePrivacidade } from './privacidade';
import { useCarregar } from './useCarregar';

export function AcaoPrivacidade() {
    const { oculto, alternar } = usePrivacidade();
    return <Pressable accessibilityRole="button"
        accessibilityLabel={oculto ? 'Mostrar valores financeiros' : 'Ocultar valores financeiros'}
        accessibilityState={{ selected: oculto }} onPress={alternar}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <Ionicons size={22} name={oculto ? 'eye-off-outline' : 'eye-outline'} color={colors.primary} />
    </Pressable>;
}

export default function Header() {
    const { dados: usuario, carregando, erro, recarregar } = useCarregar(obterUsuario);
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const nome = usuario ? nomeParaExibir(usuario) : null;

    return <View style={styles.header}>
        <View style={[conteudoTela(width, ui.width.dashboard), styles.linha]}>
            <View style={styles.avatar} accessible={false}>
                <Text style={styles.avatarText}>{nome?.charAt(0).toUpperCase() ?? '—'}</Text>
            </View>
            <View style={styles.identidade}>
                {nome ? <Text accessibilityRole="header" style={styles.greeting}>Olá, {nome}</Text> : null}
                {!nome && carregando ? <Text style={styles.status}>Carregando perfil…</Text> : null}
                {erro ? <Pressable accessibilityRole="button" onPress={recarregar} style={styles.retry}>
                    <Text style={styles.status}>Perfil indisponível. Tentar novamente</Text>
                </Pressable> : null}
            </View>
            <AcaoPrivacidade />
            <Pressable accessibilityRole="button" accessibilityLabel="Configurações"
                onPress={() => navigation.getParent()?.dispatch(CommonActions.navigate({ name: 'Home', params: { screen: 'Configuracoes' } }))}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <Ionicons size={22} name="settings-outline" color={colors.primary} />
            </Pressable>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    linha: { flexDirection: 'row', alignItems: 'center', gap: ui.space.xs, paddingVertical: ui.space.sm },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.primary, fontSize: 18, fontWeight: '600' },
    identidade: { flex: 1, minWidth: 0, paddingHorizontal: ui.space.sm },
    greeting: { color: colors.text, fontSize: 17, fontWeight: '600' },
    action: { minWidth: ui.touch, minHeight: ui.touch, alignItems: 'center', justifyContent: 'center', borderRadius: ui.radius },
    pressed: { backgroundColor: colors.surfaceRaised },
    retry: { minHeight: ui.touch, justifyContent: 'center' },
    status: { color: colors.textMuted, fontSize: ui.font.label },
});
