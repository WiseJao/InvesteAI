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
                <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando" />
            </View>
        );
    }

    if (erro) {
        return (
            <>
                <View style={styles.centro}>
                    <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text>
                    {temDados && <Text style={styles.anterior}>Exibindo a última consulta bem-sucedida.</Text>}
                    <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={onTentarNovamente}>
                        <Text style={styles.tentar}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
                {temDados ? children : null}
            </>
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
    botao: { minHeight: 44, justifyContent: 'center' },
    anterior: { color: colors.textMuted, textAlign: 'center' },
    tentar: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
    },
});
