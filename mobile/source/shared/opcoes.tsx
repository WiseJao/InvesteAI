import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

type OpcoesProps<T extends string> = {
    rotulo: string;
    opcoes: readonly { valor: T; texto: string }[];
    selecionado: T;
    onSelecionar: (valor: T) => void;
};

// Escolha única entre algumas opções (substitui um campo de texto livre).
export default function Opcoes<T extends string>({ rotulo, opcoes, selecionado, onSelecionar }: OpcoesProps<T>) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <View style={styles.linha}>
                {opcoes.map((opcao) => {
                    const ativa = opcao.valor === selecionado;
                    return (
                        <TouchableOpacity
                            key={opcao.valor}
                            style={[styles.opcao, ativa && styles.opcaoAtiva]}
                            onPress={() => onSelecionar(opcao.valor)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: ativa }}
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
    wrapper: {
        marginBottom: 16,
    },
    rotulo: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 6,
    },
    linha: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    opcao: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.surface,
    },
    opcaoAtiva: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    texto: {
        fontSize: 12,
        color: colors.text,
    },
    textoAtivo: {
        color: colors.onPrimary,
        fontWeight: 'bold',
    },
});
