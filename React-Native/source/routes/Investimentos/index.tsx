import { ScrollView, Text,StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export default function Investimentos() {
    return (
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.text}>Investimentos</Text>
        </ScrollView>
    );
}
