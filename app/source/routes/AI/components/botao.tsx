import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

type BotaoProps = {
    titulo: string;
    onPress?: () => void;
};

export default function Botao({ titulo, onPress }: BotaoProps) {
    return (
        <TouchableOpacity style={styles.botao} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.texto}>{titulo}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botao: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    texto: {
        color: colors.onPrimary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
