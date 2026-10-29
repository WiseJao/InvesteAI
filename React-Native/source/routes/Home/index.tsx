import { View, Text, StyleSheet } from 'react-native';
import Header from '../../shared/header';
import BalanceDivider from './components/balanceDivider';
import { globalStyles } from '../../styles/global';

export default function Home() {
    return (
        <View style={globalStyles.container}>
            <Header/>
            <BalanceDivider/>
            <Text>Home</Text>
        </View>
    );
}

