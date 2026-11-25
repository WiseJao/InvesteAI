import { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { colors } from '../../../styles/colors';

export default function ImagemAtivo({ uri, size = 36, fixed = false }: { uri?: string | null; size?: number; fixed?: boolean }) {
    const [failed, setFailed] = useState<string | null>(null);
    let https = false;
    try { https = !!uri && new URL(uri).protocol === 'https:'; } catch {}
    const source = https && uri && uri !== failed ? uri : null;
    const style = { width: size, height: size, borderRadius: size / 4 };
    return <View pointerEvents="none" style={{ ...style, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {source ? /\.svg(?:[?#]|$)/i.test(source)
            ? <SvgUri uri={source} width={size} height={size} onError={() => setFailed(source)} />
            : <Image source={{ uri: source }} style={style} resizeMode="contain" onError={() => setFailed(source)} />
            : <Ionicons name={fixed ? 'wallet-outline' : 'trending-up-outline'} size={size * 0.55} color={colors.primary} />}
    </View>;
}
