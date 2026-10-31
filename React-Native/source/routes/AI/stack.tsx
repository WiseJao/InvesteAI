import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AI from './index';
import PerfilInvestidor from './perfilInvestidor';
import Recomendacoes from './recomendacoes';
import type { AIStackParamList } from './types';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AI" component={AI} />
            <Stack.Screen name="PerfilInvestidor" component={PerfilInvestidor} />
            <Stack.Screen name="Recomendacoes" component={Recomendacoes} />
        </Stack.Navigator>
    );
}
