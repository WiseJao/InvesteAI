import { View, Text, StyleSheet } from 'react-native';

export default function BalanceDivider() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Saldo</Text>
            <View style={styles.divider} />
            <Text style={styles.text}>Saldo</Text>
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
    text: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});