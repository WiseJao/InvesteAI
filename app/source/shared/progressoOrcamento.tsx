import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../styles/colors';
import { usePrivacidade } from './privacidade';

type Props = {
    gasto: number;
    orcamento: number;
    onEditarRenda: () => void;
};

export default function ProgressoOrcamento({ gasto, orcamento, onEditarRenda }: Props) {
    const { oculto } = usePrivacidade();
    if (oculto) return <Text style={styles.rotulo}>Percentual oculto</Text>;
    if (!(orcamento > 0)) return <View>
        <Text style={styles.rotulo}>Orçamento sem renda prevista ou receitas</Text>
        <Pressable accessibilityRole="button" onPress={onEditarRenda} style={styles.acao}>
            <Text style={styles.link}>Editar renda mensal</Text>
        </Pressable>
    </View>;

    const percentual = Math.max(0, gasto / orcamento * 100);
    const excedido = percentual > 100;
    const largura = Math.min(percentual, 100);
    return <View style={styles.bloco}>
        <View style={styles.trilho}>
            {largura > 0 && <LinearGradient colors={excedido ? colors.budgetExceededGradient : colors.budgetGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.preenchimento, { width: (largura + '%') as ViewPercent }]} />}
        </View>
        <Text style={[styles.rotulo, excedido && styles.excedido]}>
            {excedido ? 'Orçamento ultrapassado · ' : ''}{Math.round(percentual)}% do orçamento usado
        </Text>
    </View>;
}

type ViewPercent = `${number}%`;

const styles = StyleSheet.create({
    bloco: { gap: ui.space.sm },
    trilho: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.progressTrack },
    preenchimento: { height: '100%', borderRadius: 4 },
    rotulo: { color: colors.textMuted, fontSize: ui.font.label, lineHeight: 18 },
    excedido: { color: colors.warning },
    acao: { minHeight: ui.touch, justifyContent: 'center', alignSelf: 'flex-start' },
    link: { color: colors.primary, fontSize: ui.font.body, fontWeight: '600' },
});
