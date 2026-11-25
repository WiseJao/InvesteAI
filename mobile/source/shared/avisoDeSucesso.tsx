import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

const listeners = new Set<(message: string) => void>();

export function avisarSucesso(message: string) {
    listeners.forEach(listener => listener(message));
}

export default function AvisoDeSucesso() {
    const [aviso, setAviso] = useState<{ texto: string } | null>(null);
    useEffect(() => {
        const mostrar = (texto: string) => {
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(texto);
            setAviso({ texto });
        };
        listeners.add(mostrar);
        return () => { listeners.delete(mostrar); };
    }, []);
    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(() => setAviso(null), 3500);
        return () => clearTimeout(timer);
    }, [aviso]);
    return (
        <View pointerEvents="none" style={styles.posicao}>
            <Text accessibilityLiveRegion="polite" style={aviso ? styles.visivel : styles.oculto}>{aviso?.texto ?? ''}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    posicao: { position: 'absolute', left: 16, right: 16, bottom: 92, alignItems: 'center' },
    visivel: { color: colors.text, backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1, borderRadius: 8, padding: 12 },
    oculto: { height: 0 },
});
