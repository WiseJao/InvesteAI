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
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
    },
    texto: {
        fontSize: 13,
        color: colors.text,
    },
});
