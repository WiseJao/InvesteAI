import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

type ColunaProps = {
    titulo: string;
    valor: string;
    destaque: string;
};

function Coluna({ titulo, valor, destaque }: ColunaProps) {
    return (
        <View style={styles.coluna}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.valor}>{valor}</Text>
            <View style={styles.destaque}>
                <Text style={styles.destaqueTexto}>{destaque}</Text>
            </View>
        </View>
    );
}

export default function BalanceDivider() {
    return (
        <View style={styles.container}>
            <Coluna titulo="Saldo geral" valor="R$ 12.345.678,90" destaque="+123.456,78 (1%)" />
            <View style={styles.divider} />
            <Coluna titulo="Objetivo principal" valor="R$ 12.345.678,90" destaque="1% alcançado" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    coluna: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: colors.primary,
    },
    titulo: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 6,
    },
    valor: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    destaque: {
        backgroundColor: colors.positive,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    destaqueTexto: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.text,
    },
});
