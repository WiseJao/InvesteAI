import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, ui } from '../styles/colors';

type OpcoesProps<T extends string> = {
    rotulo: string;
    variante?: 'vertical' | 'segmentada';
    opcoes: readonly { valor: T; texto: string }[];
    selecionado: T;
    onSelecionar: (valor: T) => void;
};

// Escolha única entre algumas opções (substitui um campo de texto livre).
export default function Opcoes<T extends string>({ rotulo, variante, opcoes, selecionado, onSelecionar }: OpcoesProps<T>) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <View style={[styles.linha, variante === 'vertical' && styles.vertical, variante === 'segmentada' && styles.segmentada]}>
                {opcoes.map((opcao) => {
                    const ativa = opcao.valor === selecionado;
                    return (
                        <TouchableOpacity
                            key={opcao.valor}
                            style={[styles.opcao, variante === 'segmentada' && styles.segmento, ativa && styles.opcaoAtiva]}
                            onPress={() => onSelecionar(opcao.valor)}
                            accessibilityRole={variante === 'vertical' ? 'radio' : 'button'}
                            accessibilityState={variante === 'vertical' ? { checked: ativa } : { selected: ativa }}
                        >
                            <Text style={[styles.texto, ativa && styles.textoAtivo]}>{opcao.texto}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { gap: ui.space.xs },
    rotulo: {
        fontSize: ui.font.label,
        color: colors.textMuted,
    },
    linha: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    vertical: { flexDirection: 'column' },
    segmentada: { padding: ui.space.xs, backgroundColor: colors.background, borderRadius: ui.radius },
    segmento: { flexGrow: 1, flexBasis: 112, alignItems: 'center' },
    opcao: {
        borderWidth: 1,
        borderColor: colors.controlBorder,
        borderRadius: 16,
        paddingHorizontal: 12,
        minHeight: ui.touch,
        justifyContent: 'center',
        paddingVertical: 8,
        backgroundColor: colors.surface,
    },
    opcaoAtiva: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    texto: {
        fontSize: ui.font.label,
        color: colors.text,
    },
    textoAtivo: {
        color: colors.onPrimary,
        fontWeight: 'bold',
    },
});
