import { StyleSheet } from "react-native";

const cores ={
    background :'#000000',
    text : '#ffffff',
    subtitle: '#b8b8b8'
}

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.background,
        padding: 20
    },
    title: {
        color: cores.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: cores.subtitle,
        fontSize: 14,
        marginTop: 5,
        marginBottom: 20,
    }
});