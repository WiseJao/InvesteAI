import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

type BotaoProps = {
    titulo: string;
    onPress: () => void;
    icone: keyof typeof Ionicons.glyphMap;
};

export default function Botao({
    titulo,
    onPress,
    icone
}: BotaoProps) {
    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.circulo}>
                <Ionicons
                    size={25}
                    name={icone}
                    color={colors.primary}
                />
            </View>

            <Text style={styles.titulo}>
                {titulo}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 62,
        alignItems: 'center',
        gap: 5,
    },

    circulo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    titulo: {
        fontSize: 10,
        textAlign: 'center',
        color: colors.text,
    },
});