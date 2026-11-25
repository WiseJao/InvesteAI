import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './index';
import Perfil from '../Perfil';
import Seguranca from '../Perfil/seguranca';
import Configuracoes from '../Perfil/configuracoes';
import FAQ from '../Perfil/faq';
import Objetivos from '../Perfil/objetivos';
import type { HomeStackParamList } from './types';
import { Text } from 'react-native';
import Layout from '../../shared/layout';
import { usePrivacidade } from '../../shared/privacidade';
import { colors } from '../../styles/colors';

const Stack = createNativeStackNavigator<HomeStackParamList>();

function PerfilProtegido() {
    const { oculto } = usePrivacidade();
    return oculto ? <Layout titulo="Perfil" voltar><Text style={{ color: colors.text }}>Perfil oculto. Use o botão de privacidade para exibi-lo.</Text></Layout> : <Perfil />;
}

export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Perfil" component={PerfilProtegido} />
            <Stack.Screen name="Seguranca" component={Seguranca} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="FAQ" component={FAQ} />
            <Stack.Screen name="Objetivos" component={Objetivos} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
}
