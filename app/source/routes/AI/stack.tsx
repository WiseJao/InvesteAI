import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AI from './index';
import Questionario from './questionario';
import PerfilInvestidor from './perfilInvestidor';
import Recomendacoes from './recomendacoes';
import type { AIStackParamList } from './types';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="InicioAssessoria" component={AI} />
            <Stack.Screen name="Questionario" component={Questionario} />
            <Stack.Screen name="PerfilInvestidor" component={PerfilInvestidor} />
            <Stack.Screen name="Recomendacoes" component={Recomendacoes} />
        </Stack.Navigator>
    );
}
