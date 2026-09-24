import { View, Text, StyleSheet } from 'react-native';
import Header from '../../shared/header';
import BalanceDivider from './components/balanceDivider';

export default function Home() {
    return (
        <View style={styles.container}>
            <Header/>
            <BalanceDivider/>
            <Text>Home</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    }
});