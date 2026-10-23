import { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from './header';
import { colors } from '../styles/colors';

type LayoutProps = {
    titulo?: string;
    subtitulo?: string;
    voltar?: boolean;
    comHeader?: boolean;
    children: ReactNode;
};

export default function Layout({
    titulo,
    subtitulo,
    voltar = false,
    comHeader = true,
    children,
}: LayoutProps) {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {comHeader ? <Header /> : null}
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {voltar && navigation.canGoBack() ? (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.voltar}>{'< Voltar'}</Text>
                    </TouchableOpacity>
                ) : null}
                {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
                {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
                {children}
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
        padding: 20,
        paddingBottom: 40,
    },
    voltar: {
        color: colors.primary,
        fontSize: 13,
        marginBottom: 16,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitulo: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 16,
    },
});
