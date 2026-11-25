import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles/colors';
import Field from './field';
import { brParaIso } from './datas';

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    opcional?: boolean;
    impedirLimpeza?: boolean;
};

export default function CampoData({ label, value, onChange, opcional = false, impedirLimpeza = false }: Props) {
    const [aberto, setAberto] = useState(false);
    const [rascunho, setRascunho] = useState(new Date());

    function abrir() {
        const iso = brParaIso(value);
        const partes = iso?.split('-').map(Number);
        setRascunho(partes ? new Date(partes[0], partes[1] - 1, partes[2], 12) : new Date());
        setAberto(true);
    }

    function selecionar(data: Date) {
        onChange(`${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`);
    }

    const picker = <DateTimePicker value={rascunho} mode="date" onChange={(evento, data) => {
        if (Platform.OS === 'android') {
            setAberto(false);
            if (evento.type === 'set' && data) selecionar(data);
        } else if (data) setRascunho(data);
    }} />;

    if (Platform.OS === 'web') return <Field label={label} placeholder="DD/MM/AAAA"
        maxLength={10} value={value} onChangeText={onChange} />;

    return <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.input} onPress={abrir} accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'não informada'}`} accessibilityHint="Abrir seletor de data">
            <Text style={value ? styles.texto : styles.label}>{value || 'Selecionar data'}</Text>
        </Pressable>
        {opcional && value && !impedirLimpeza ? <Pressable onPress={() => onChange('')} accessibilityRole="button" accessibilityLabel={`Limpar ${label}`}><Text style={styles.acao}>Limpar data</Text></Pressable> : null}
        {impedirLimpeza ? <Text style={styles.aviso}>Não é possível remover uma data já salva.</Text> : null}
        {aberto && Platform.OS === 'android' ? picker : null}
        {Platform.OS === 'ios' ? <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
            <View style={styles.modal}><View style={styles.painel}>
                {picker}
                <Pressable onPress={() => setAberto(false)} accessibilityRole="button"><Text style={styles.acao}>Cancelar</Text></Pressable>
                <Pressable onPress={() => { selecionar(rascunho); setAberto(false); }} accessibilityRole="button"><Text style={styles.acao}>Confirmar</Text></Pressable>
            </View></View>
        </Modal> : null}
    </View>;
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface },
    texto: { fontSize: 15, color: colors.text },
    acao: { color: colors.primary, paddingVertical: 10 },
    aviso: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
    modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    painel: { backgroundColor: colors.surface, padding: 20 },
});