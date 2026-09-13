
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Investimentos from './Investimentos';
import Home from './Home';
import Gastos from './Gastos';
import AI from './AI';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function TabRouter() {
    return (
        <Tab.Navigator initialRouteName="Home">
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Investimentos" component={InvestimentoStack}  />
            <Tab.Screen name="Gastos" component={GastosStack} />
            <Tab.Screen name="AI" component={AIStack} />
        </Tab.Navigator>
    );
}

function HomeStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function InvestimentoStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen name="Investimentos" component={Investimentos} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function GastosStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen name="Gastos" component={Gastos} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function AIStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen name="AI" component={AI} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}