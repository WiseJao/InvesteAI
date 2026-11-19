import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Gastos from './index';
import GastosFixos from './fixos';
import GastosVariaveis from './variaveis';
import HistoricoGastos from './historico';
import type { GastosStackParamList } from './types';

const Stack = createNativeStackNavigator<GastosStackParamList>();

export default function GastosStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Gastos" component={Gastos} />
            <Stack.Screen name="GastosFixos" component={GastosFixos} />
            <Stack.Screen name="GastosVariaveis" component={GastosVariaveis} />
            <Stack.Screen name="HistoricoGastos" component={HistoricoGastos} />
        </Stack.Navigator>
    );
}
