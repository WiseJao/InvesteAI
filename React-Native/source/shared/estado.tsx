import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

type EstadoProps = {
    carregando: boolean;
    erro: string | null;
    temDados: boolean;
    onTentarNovamente: () => void;
    children: ReactNode;
};

// Mostra "carregando" na primeira carga, a mensagem de erro (com botão para tentar de novo)
// quando não há dados, ou o conteúdo da tela.
export default function Estado({ carregando, erro, temDados, onTentarNovamente, children }: EstadoProps) {
    if (!temDados && carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    if (erro && !temDados) {
        return (
            <View style={styles.centro}>
                <Text style={styles.erro}>{erro}</Text>
                <TouchableOpacity onPress={onTentarNovamente}>
                    <Text style={styles.tentar}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    centro: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    erro: {
        color: colors.negative,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    tentar: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
    },
});
