import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, StyleSheet } from 'react-native';

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
                    color="#555555"
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
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    titulo: {
        fontSize: 10,
        textAlign: 'center',
        color: '#ffffff',
    },
});