import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

type BotaoExcluirProps = {
    rotulo: string;
    onConfirmar: () => void;
    detalhe?: string;
    carregando?: boolean;
};

// Excluir em dois passos (o primeiro toque só pede a confirmação). Funciona igual no celular e na web.
export default function BotaoExcluir({ rotulo, onConfirmar, detalhe, carregando = false }: BotaoExcluirProps) {
    const [confirmando, setConfirmando] = useState(false);

    if (!confirmando) {
        return (
            <TouchableOpacity style={styles.botao} onPress={() => setConfirmando(true)} accessibilityRole="button">
                <Text style={styles.texto}>{rotulo}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.confirmacao}>
            <Text style={styles.pergunta}>{detalhe ?? rotulo + '? Esta ação não pode ser desfeita.'}</Text>
            <View style={styles.linha}>
                <TouchableOpacity
                    style={[styles.opcao, styles.cancelar]}
                    onPress={() => setConfirmando(false)}
                    disabled={carregando}
                    accessibilityRole="button"
                >
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.opcao, styles.confirmar]}
                    onPress={onConfirmar}
                    disabled={carregando}
                    accessibilityRole="button"
                >
                    {carregando ? <ActivityIndicator color={colors.text} /> : <Text style={styles.textoConfirmar}>{rotulo}</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    botao: {
        borderWidth: 1,
        borderColor: colors.negative,
        borderRadius: 10,
        minHeight: 48,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    texto: {
        color: colors.negative,
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmacao: {
        marginTop: 12,
    },
    pergunta: {
        color: colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 10,
    },
    linha: {
        flexDirection: 'row',
        gap: 10,
    },
    opcao: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelar: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    confirmar: {
        backgroundColor: colors.negative,
    },
    textoCancelar: {
        color: colors.text,
        fontSize: 15,
    },
    textoConfirmar: {
        color: colors.text,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
