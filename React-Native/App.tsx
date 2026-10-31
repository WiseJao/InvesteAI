import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './source/routes/types';
import Router from './source/routes/Router';
import Login from './source/routes/Login';
import Cadastro from './source/routes/Cadastro';
import EsqueciSenha from './source/routes/EsqueciSenha';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <NavigationContainer>
            <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="Login" component={Login} />
                <RootStack.Screen name="Cadastro" component={Cadastro} />
                <RootStack.Screen name="EsqueciSenha" component={EsqueciSenha} />
                <RootStack.Screen name="Main" component={Router} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
