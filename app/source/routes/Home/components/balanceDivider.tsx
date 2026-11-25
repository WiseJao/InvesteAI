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

type BalanceDividerProps = {
    saldo: string;
    saldoDestaque: string;
    objetivo: string;
    objetivoDestaque: string;
};

export default function BalanceDivider({ saldo, saldoDestaque, objetivo, objetivoDestaque }: BalanceDividerProps) {
    return (
        <View style={styles.container}>
            <Coluna titulo="Saldo do mês" valor={saldo} destaque={saldoDestaque} />
            <View style={styles.divider} />
            <Coluna titulo="Objetivo principal" valor={objetivo} destaque={objetivoDestaque} />
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
        textAlign: 'center',
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
