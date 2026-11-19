import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './index';
import Perfil from '../Perfil';
import Seguranca from '../Perfil/seguranca';
import Configuracoes from '../Perfil/configuracoes';
import FAQ from '../Perfil/faq';
import Objetivos from '../Perfil/objetivos';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Seguranca" component={Seguranca} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="FAQ" component={FAQ} />
            <Stack.Screen name="Objetivos" component={Objetivos} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
}
