import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Gastos from './index';
import type { GastosStackParamList } from './types';

const Stack = createNativeStackNavigator<GastosStackParamList>();

export default function GastosStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Gastos" component={Gastos} />
        </Stack.Navigator>
    );
}
