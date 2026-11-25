import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../Home/types';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import ItemLista from './components/itemLista';
import BotaoPrimario from '../../shared/botaoPrimario';
import { usePrivacidade } from '../../shared/privacidade';
import { colors } from '../../styles/colors';

export default function Configuracoes() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { preferences, savePreferences, ready, oculto, reloadPreferences } = usePrivacidade();
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    async function change(value: boolean) {
        setSaving(true);
        setStatus('');
        try {
            await savePreferences({ hideOnStart: value });
            setStatus('Preferência salva.');
        } catch {
            setStatus('Não foi possível salvar a preferência. Tente novamente.');
        } finally {
            setSaving(false);
        }
    }

    return <Layout titulo="Configurações" voltar>
        <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.text, fontSize: 15 }}>Ocultar valores ao abrir o app</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Valor, saldo e renda ficam ocultos ao iniciar a sessão.</Text>
                </View>
                <Switch accessibilityLabel="Ocultar valores ao abrir o app" disabled={!ready || saving}
                    value={preferences.hideOnStart} onValueChange={value => void change(value)} />
            </View>
            {(status || !ready) && <Text accessibilityLiveRegion="polite" style={{ color: colors.textMuted, marginTop: 8 }}>
                {status || 'Preferências ainda indisponíveis.'}
            </Text>}
        </Card>
        {!ready && <BotaoPrimario titulo="Recarregar preferências" onPress={reloadPreferences} />}
        <Card>
            <ItemLista rotulo="Editar perfil e renda mensal" onPress={oculto ? undefined : () => navigation.navigate('EditarPerfil')} />
            <ItemLista rotulo="Alterar senha" onPress={() => navigation.navigate('Seguranca')} />
        </Card>
    </Layout>;
}
