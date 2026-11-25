import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';

type CabecalhoPesquisaProps = {
    titulo: string;
    aberto: boolean;
    termo: string;
    onAlternar: () => void;
    onChangeTermo: (termo: string) => void;
};

export default function CabecalhoPesquisa({
    titulo,
    aberto,
    termo,
    onAlternar,
    onChangeTermo,
}: CabecalhoPesquisaProps) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.linha}>
                <View style={styles.lateral} />
                <Text style={styles.titulo}>{titulo}</Text>
                <TouchableOpacity
                    style={styles.lateral}
                    onPress={onAlternar}
                    accessibilityLabel={aberto ? 'Fechar pesquisa' : 'Abrir pesquisa'}
                >
                    <Ionicons
                        name={aberto ? 'close' : 'search-outline'}
                        size={22}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {aberto ? (
                <TextInput
                    style={styles.campo}
                    placeholder="Pesquisa..."
                    placeholderTextColor={colors.textMuted}
                    value={termo}
                    onChangeText={onChangeTermo}
                    autoFocus
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lateral: {
        width: 32,
        alignItems: 'flex-end',
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    campo: {
        marginTop: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 13,
        color: colors.text,
    },
});
