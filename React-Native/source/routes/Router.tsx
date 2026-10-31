
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'
import Investimentos from './Investimentos';
import HomeStack from './Home/stack';
import GastosStack from './Gastos/stack';
import AIStack from './AI/stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function TabRouter() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeStack} options={{
                tabBarIcon: () =>(
                    <Ionicons
                    size={20}
                    name='home'
                    />
                )
            }} />
            <Tab.Screen name="Investimentos" component={InvestimentoStack} options={{
                tabBarIcon: () => (
                    <Ionicons
                    size={20}
                    name='cash'
                    />
                )
            }} />
            <Tab.Screen name="Gastos" component={GastosStack} options={{
                tabBarIcon: () => (
                    <Ionicons
                    size={20}
                    name='card'
                    />
                )
            }} />
            <Tab.Screen name="AI" component={AIStack} options={{
                tabBarIcon: () => (
                    <Ionicons
                    size={20}
                    name='sparkles'
                    />
                )
            }} />
        </Tab.Navigator>
    );
}


function InvestimentoStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen name="Investimentos" component={Investimentos} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

