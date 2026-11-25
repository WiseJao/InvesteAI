import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../Home/types';
import Layout from '../../shared/layout';
import BotaoPrimario from '../../shared/botaoPrimario';
import { usePrivacidade } from '../../shared/privacidade';
import { colors } from '../../styles/colors';

export default function Configuracoes() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { preferences, savePreferences, ready, oculto } = usePrivacidade();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    async function change(key: keyof typeof preferences, value: boolean) {
        setSaving(true);
        setError(false);
        try {
            await savePreferences({ ...preferences, [key]: value });
        } catch {
            setError(true);
        } finally {
            setSaving(false);
        }
    }

    return <Layout titulo="Configurações" voltar>
        <BotaoPrimario titulo="Editar perfil e renda mensal" onPress={() => navigation.navigate('EditarPerfil')} desabilitado={oculto} />
        <BotaoPrimario titulo="Alterar senha" onPress={() => navigation.navigate('Seguranca')} />
        {([['hideOnStart', 'Ocultar valores ao abrir o app'], ['opaqueTabs', 'Usar barra de abas opaca']] as const).map(([key, label]) =>
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
                <Text style={{ flex: 1, color: colors.text }}>{label}</Text>
                <Switch accessibilityLabel={label} disabled={!ready || saving} value={preferences[key]}
                    onValueChange={value => void change(key, value)} />
            </View>
        )}
        {(!ready || error) && <Text accessibilityLiveRegion="polite" style={{ color: colors.textMuted }}>
            {error ? 'Não foi possível salvar a preferência. Tente novamente.' : 'Preferências ainda indisponíveis.'}
        </Text>}
    </Layout>;
}
