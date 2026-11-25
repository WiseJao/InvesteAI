import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { restoreSession, onSessionEnded } from './source/services/api';
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
            </>}
        </View>;
    }
    return (
        <NavigationContainer ref={navigation}>
            <RootStack.Navigator initialRouteName={session === 'active' ? 'Main' : 'Login'} screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="Login" component={Login} />
                <RootStack.Screen name="Cadastro" component={Cadastro} />
                <RootStack.Screen name="EsqueciSenha" component={EsqueciSenha} />
                <RootStack.Screen name="Main" component={Router} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
