import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../shared/card';
import { formatarReais } from '../../../shared/currency';
import { colors } from '../../../styles/colors';
import type { Gasto } from '../dados';

type ListaGastosProps = {
    itens: Gasto[];
    vazio?: string;
};

export default function ListaGastos({ itens, vazio = 'Nenhum lançamento por aqui ainda.' }: ListaGastosProps) {
    if (itens.length === 0) {
        return (
            <Card>
                <Text style={styles.vazio}>{vazio}</Text>
            </Card>
        );
    }

    return (
        <Card>
            {itens.map((item, indice) => (
                <View key={item.id} style={[styles.linha, indice > 0 && styles.separador]}>
                    <View style={styles.textos}>
                        <Text style={styles.nome}>{item.nome}</Text>
                        <Text style={styles.detalhe}>{item.detalhe}</Text>
                    </View>
                    <Text style={[styles.valor, item.entrada && styles.entrada]}>
                        {item.entrada ? '+ ' : ''}
                        {formatarReais(item.valor)}
                    </Text>
                </View>
            ))}
        </Card>
    );
}

const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    separador: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    textos: {
        flex: 1,
        paddingRight: 12,
    },
    nome: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    detalhe: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
    valor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    entrada: {
        color: colors.positive,
    },
    vazio: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        paddingVertical: 8,
    },
});
