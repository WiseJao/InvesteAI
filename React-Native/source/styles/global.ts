import { StyleSheet } from "react-native";

const cores ={
    background :'#000000',
    text : '#ffffff',
}

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.background,
    },
    text: {
        color: cores.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});