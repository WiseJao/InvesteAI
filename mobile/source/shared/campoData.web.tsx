import { createElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../styles/colors';
import { brParaIso, isoParaBr } from './datas';

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    opcional?: boolean;
    impedirLimpeza?: boolean;
};

export default function CampoData({ label, value, onChange, opcional = false, impedirLimpeza = false }: Props) {
    return <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        {createElement('input', {
            type: 'date',
            'aria-label': label,
            value: brParaIso(value) ?? '',
            onChange: (evento: React.ChangeEvent<HTMLInputElement>) => {
                if (evento.target.value) onChange(isoParaBr(evento.target.value));
                else if (opcional && !impedirLimpeza) onChange('');
            },
            style: { border: `1px solid ${colors.controlBorder}`, borderRadius: 10, padding: 12, color: colors.text, backgroundColor: colors.surface, fontSize: 15 },
        })}
        {opcional && value && !impedirLimpeza ? <Pressable onPress={() => onChange('')} accessibilityRole="button" accessibilityLabel={`Limpar ${label}`}><Text style={styles.acao}>Limpar data</Text></Pressable> : null}
        {impedirLimpeza ? <Text style={styles.aviso}>Não é possível remover uma data já salva.</Text> : null}
    </View>;
}

const styles = StyleSheet.create({
    wrapper: { gap: ui.space.xs },
    label: { fontSize: ui.font.label, color: colors.textMuted },
    acao: { color: colors.primary, paddingVertical: 10 },
    aviso: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});