import type { ViewStyle } from 'react-native';
import { ui } from '../styles/colors';

export function conteudoTela(largura: number, maxWidth: number = ui.width.reading): ViewStyle {
    return {
        width: '100%',
        maxWidth,
        alignSelf: 'center',
        paddingHorizontal: largura < 360 ? 16 : largura < 600 ? 20 : 24,
    };
}
