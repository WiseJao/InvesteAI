import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AI from './index';
import type { AIStackParamList } from './types';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AI" component={AI} />
        </Stack.Navigator>
    );
}
