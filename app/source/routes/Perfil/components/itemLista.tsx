import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';

type ItemListaProps = {
    rotulo: string;
    onPress?: () => void;
};

export default function ItemLista({ rotulo, onPress }: ItemListaProps) {
    return (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
            accessibilityRole={onPress ? "button" : undefined}
        >
            <Text style={styles.texto}>{rotulo}</Text>
            {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.primary} /> : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        minHeight: 48,
        gap: 8,
        paddingVertical: 8,
    },
    texto: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
});
