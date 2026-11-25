
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const { bottom } = useSafeAreaInsets();
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            headerShown: false, tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted,
            tabBarItemStyle: { minHeight: 48 },
            tabBarActiveBackgroundColor: colors.surfaceRaised,
            tabBarLabelPosition: 'below-icon',
            tabBarLabelStyle: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
            tabBarStyle: { height: 60 + bottom, backgroundColor: colors.surface, borderTopColor: colors.border },
        }}>
            <Tab.Screen name="Home" component={HomeStack} options={{
                tabBarLabel: 'Início',
                tabBarIcon: ({ color, focused }) =>(
                    <Ionicons
                    size={20}
                    color={color}
                    name={focused ? 'home' : 'home-outline'}
                    />
                )
            }} />
            <Tab.Screen name="Investimentos" component={InvestimentoStack} options={{
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                    size={20}
                    color={color}
                    name={focused ? 'cash' : 'cash-outline'}
                    />
                )
            }} />
            <Tab.Screen name="Gastos" component={GastosStack} options={{
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                    size={20}
                    color={color}
                    name={focused ? 'card' : 'card-outline'}
                    />
                )
            }} />
            <Tab.Screen name="AI" component={AIStack} options={{
                tabBarLabel: 'Assessoria',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                    size={20}
                    color={color}
                    name={focused ? 'sparkles' : 'sparkles-outline'}
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

