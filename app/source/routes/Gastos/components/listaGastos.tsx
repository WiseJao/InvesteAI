import MarcadorCor from '../../../shared/marcadorCor';
import { corDaConta, corDaCategoria } from '../../../styles/coresDaConta';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../../../shared/card';
import { formatarReais } from '../../../shared/currency';
import { usePrivacidade } from '../../../shared/privacidade';
import { colors } from '../../../styles/colors';
import type { Gasto } from '../dados';

type ListaGastosProps = {
    itens: Gasto[];
    vazio?: string;
    onSelecionar?: (id: string) => void;
};

export default function ListaGastos({ itens, vazio = 'Nenhum lançamento por aqui ainda.', onSelecionar }: ListaGastosProps) {
    const { oculto } = usePrivacidade();
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
                <TouchableOpacity
                    key={item.id}
                    style={[styles.linha, indice > 0 && styles.separador]}
                    onPress={() => onSelecionar?.(item.id)}
                    disabled={!onSelecionar}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${item.nome}`}
                >
                    <MarcadorCor cor={corDaConta(item.id)} />
                    <View style={styles.textos}>
                        <Text style={styles.nome}>{item.nome}</Text>
                        <Text style={styles.detalhe}>{item.categoria ? <Text style={{ color: corDaCategoria(item.categoria) }}>{item.categoria} · </Text> : null}{item.detalhe}</Text>
                    </View>
                    <Text style={[styles.valor, item.entrada && styles.entrada]}>
                        {oculto ? 'Valores ocultos' : `${item.entrada ? '+ ' : '− '}${formatarReais(item.valor)}`}
                    </Text>
                </TouchableOpacity>
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
        minHeight: 52,
        columnGap: 8,
        rowGap: 4,
        flexWrap: 'wrap',
    },
    separador: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    textos: {
        flexGrow: 1,
        flexBasis: 100,
        minWidth: 0,
    },
    nome: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    detalhe: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    valor: {
        flexShrink: 1,
        marginLeft: 'auto',
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
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
