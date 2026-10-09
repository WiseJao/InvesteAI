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
    },
    container_elementos: {
        alignSelf :'auto',
        padding :10, 
        backgroundColor: '#9c9c9c',
        borderRadius: 10,
    }
});