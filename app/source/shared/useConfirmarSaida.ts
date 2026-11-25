import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import { getAuthToken } from '../services/api';

export function confirmarDescarte(descartar: () => void) {
    if (Platform.OS === 'web') {
        if (window.confirm('Descartar as alterações não salvas?')) descartar();
        return;
    }
    Alert.alert('Descartar alterações?', 'Os dados ainda não foram salvos.', [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: descartar },
    ]);
}

export function useConfirmarSaida(alterado: boolean) {
    const navigation = useNavigation();
    usePreventRemove(alterado, ({ data }) => {
        if (!getAuthToken()) navigation.dispatch(data.action);
        else confirmarDescarte(() => navigation.dispatch(data.action));
    });
}
