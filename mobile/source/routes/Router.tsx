
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'
import Investimentos from './Investimentos';
import HomeStack from './Home/stack';
import GastosStack from './Gastos/stack';
import AIStack from './AI/stack';
import { colors } from '../styles/colors';
import { PrivacidadeProvider } from '../shared/privacidade';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function TabRouter() {
    return <PrivacidadeProvider><Tabs /></PrivacidadeProvider>;
}

function Tabs() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            headerShown: false, tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted,
            tabBarItemStyle: { minHeight: 48 },
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        }}>
            <Tab.Screen name="Home" component={HomeStack} options={{
                tabBarIcon: ({ color }) =>(
                    <Ionicons
                    size={20}
                    color={color}
                    name='home'
                    />
                )
            }} />
            <Tab.Screen name="Investimentos" component={InvestimentoStack} options={{
                tabBarIcon: ({ color }) => (
                    <Ionicons
                    size={20}
                    color={color}
                    name='cash'
                    />
                )
            }} />
            <Tab.Screen name="Gastos" component={GastosStack} options={{
                tabBarIcon: ({ color }) => (
                    <Ionicons
                    size={20}
                    color={color}
                    name='card'
                    />
                )
            }} />
            <Tab.Screen name="AI" component={AIStack} options={{
                tabBarLabel: 'Assessoria',
                tabBarIcon: ({ color }) => (
                    <Ionicons
                    size={20}
                    color={color}
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

