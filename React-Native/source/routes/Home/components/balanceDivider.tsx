import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global';

export default function BalanceDivider() {
    return (
        <View style={styles.container}>
            <Text style={globalStyles.title}>Saldo</Text>
            <View style={styles.divider} />
            <Text style={globalStyles.title}>Saldo</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    divider: {
        borderLeftWidth: 1,
        borderLeftColor: '#ffffff',
        height: 100,
    },
});