import { View } from 'react-native';

export default function MarcadorCor({ cor }: { cor: string }) {
    return <View accessibilityElementsHidden importantForAccessibility="no"
        style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, backgroundColor: cor }} />;
}
