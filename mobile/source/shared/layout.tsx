import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AcaoPrivacidade } from './header';
import { conteudoTela } from './conteudoTela';
import { colors, ui } from '../styles/colors';

type LayoutProps = {
    titulo?: string;
    subtitulo?: string;
    voltar?: boolean;
    comHeader?: boolean;
    formulario?: boolean;
    children: ReactNode;
};

export default function Layout({ titulo, subtitulo, voltar = false, comHeader = true, formulario = false, children }: LayoutProps) {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const podeVoltar = voltar && navigation.canGoBack();
    const recuo = conteudoTela(width, formulario ? ui.width.form : ui.width.reading);

    return <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[recuo, styles.topo]}>
            {podeVoltar && <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.voltar}>
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>}
            {titulo ? <Text accessibilityRole="header" style={styles.titulo}>{titulo}</Text> : <View style={styles.espaco} />}
            {comHeader && <AcaoPrivacidade />}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag">
            <View style={[recuo, styles.content]}>
                {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
                {children}
            </View>
        </ScrollView>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topo: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingVertical: ui.space.xs, gap: ui.space.sm },
    espaco: { flex: 1 },
    content: { paddingTop: ui.space.md, paddingBottom: ui.space.xxl, gap: ui.space.lg },
    voltar: { minWidth: ui.touch, minHeight: ui.touch, borderRadius: ui.radius, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
    titulo: { flex: 1, fontSize: ui.font.screenTitle, fontWeight: '700', color: colors.text },
    subtitulo: { fontSize: ui.font.body, lineHeight: 22, color: colors.textMuted },
});
