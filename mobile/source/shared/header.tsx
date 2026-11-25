import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { nomeParaExibir, obterUsuario } from '../services/usuario';
import { usePrivacidade } from './privacidade';
import { useCarregar } from './useCarregar';


type HeaderProps = {
	name?: string;
};

export default function Header({ name }: HeaderProps) {
	const { dados: usuario, carregando, erro, recarregar } = useCarregar(obterUsuario);
	const { oculto, alternar } = usePrivacidade();
	const navigation = useNavigation();

	const nomeExibido = name ?? (usuario ? nomeParaExibir(usuario) : null);

	return (
		<View style={styles.header}>
			<View style={styles.topRow}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{nomeExibido?.charAt(0).toUpperCase() ?? '—'}</Text>
				</View>

				<View style={styles.actions}>
					<Pressable accessibilityRole="button" accessibilityLabel={oculto ? 'Mostrar valores financeiros' : 'Ocultar valores financeiros'} accessibilityState={{ selected: oculto }} onPress={alternar} style={styles.action}>
						<Ionicons
							size={25}
							name={oculto ? 'eye-off-outline' : 'eye-outline'}
							color={colors.primary}
						/>
					</Pressable>
					<Pressable accessibilityRole="button" accessibilityLabel="Configurações" onPress={() => navigation.getParent()?.dispatch(CommonActions.navigate({ name: 'Home', params: { screen: 'Configuracoes' } }))} style={styles.action}>
						<Ionicons
							size={25}
							name='settings-outline'
							color={colors.primary}
						/>
					</Pressable>
				</View>
			</View>

			{nomeExibido ? <Text style={styles.greeting}>Olá, <Text style={styles.name}>{nomeExibido}</Text></Text> : null}
			{!nomeExibido && carregando ? <Text style={styles.status}>Carregando perfil…</Text> : null}
			{erro && !name ? (
				<Pressable accessibilityRole="button" onPress={recarregar} style={styles.retry}>
					<Text style={styles.status}>Perfil indisponível. Tentar novamente</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: colors.background,
		borderBottomWidth: 2,
		borderBottomColor: colors.border,
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 12,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		backgroundColor: colors.surface,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	avatarText: {
		color: colors.text,
		fontSize: 24,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 20,
		paddingTop: 4,
	},
	action: {
		minWidth: 48,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	greeting: {
		marginTop: 12,
		color: colors.text,
		fontSize: 32,
		fontWeight: '300',
	},
	retry: { minHeight: 44, justifyContent: 'center' },
	status: { color: colors.textMuted, fontSize: 14 },
	name: {
		color: colors.primary,
	},
});
