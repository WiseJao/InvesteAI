import AvisoDeSucesso from './source/shared/avisoDeSucesso';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { restoreSession, onSessionEnded, clearAuthTokens } from './source/services/api';
import { limparUsuario } from './source/services/usuario';
import { colors } from './source/styles/colors';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './source/routes/types';
import Router from './source/routes/Router';
import Login from './source/routes/Login';
import Cadastro from './source/routes/Cadastro';
import EsqueciSenha from './source/routes/EsqueciSenha';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const navigation = createNavigationContainerRef<RootStackParamList>();

export default function App() {
    const [session, setSession] = useState<'loading' | 'retry' | 'active' | 'signed-out'>('loading');

    const [erroSair, setErroSair] = useState(false);

    async function voltarAoLogin() {
        try {
            await clearAuthTokens();
            setSession('signed-out');
        } catch {
            setErroSair(true);
        }
    }

    function restore() {
        setSession('loading');
        void restoreSession().then(setSession);
    }

    useEffect(() => {
        restore();
        return onSessionEnded(() => {
            limparUsuario();
            if (navigation.isReady()) navigation.resetRoot({ routes: [{ name: 'Login' }] });
        });
    }, []);

    if (session === 'loading' || session === 'retry') {
        return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
            {session === 'loading' ? <ActivityIndicator color={colors.primary} accessibilityLabel="Restaurando sessão" /> : <>
                <Text style={{ color: colors.text }}>Não foi possível restaurar sua sessão.</Text>
                <Button title="Tentar novamente" onPress={restore} />
                <Button title="Voltar ao login" onPress={() => void voltarAoLogin()} />
                {erroSair && <Text style={{ color: colors.negative }} accessibilityLiveRegion="polite">Não foi possível apagar a sessão local. Tente novamente.</Text>}
            </>}
        </View>;
    }
    return (
        <View style={{ flex: 1 }}>
        <NavigationContainer ref={navigation}>
            <RootStack.Navigator initialRouteName={session === 'active' ? 'Main' : 'Login'} screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="Login" component={Login} />
                <RootStack.Screen name="Cadastro" component={Cadastro} />
                <RootStack.Screen name="EsqueciSenha" component={EsqueciSenha} />
                <RootStack.Screen name="Main" component={Router} />
            </RootStack.Navigator>
        </NavigationContainer>
        <AvisoDeSucesso />
        </View>
    );
}
