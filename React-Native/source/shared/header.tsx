import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { nomeParaExibir, obterUsuario } from '../services/usuario';
import { usePrivacidade } from './privacidade';


type HeaderProps = {
	name?: string;
};

export default function Header({ name }: HeaderProps) {
	const [nomeDoUsuario, setNomeDoUsuario] = useState<string | null>(null);
	const { oculto, alternar } = usePrivacidade();
	const navigation = useNavigation();

	useEffect(() => {
		let ativo = true;
		obterUsuario()
			.then((usuario) => {
				if (ativo) setNomeDoUsuario(nomeParaExibir(usuario));
			})
			.catch(() => {});
		return () => {
			ativo = false;
		};
	}, []);

	const nomeExibido = name ?? nomeDoUsuario ?? 'Usuário';

	return (
		<View style={styles.header}>
			<View style={styles.topRow}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{nomeExibido.charAt(0).toUpperCase()}</Text>
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

			<Text style={styles.greeting}>
				Olá, <Text style={styles.name}>{nomeExibido}</Text>
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: '#000',
		borderBottomWidth: 2,
		borderBottomColor: '#50d6ca',
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
		backgroundColor: '#ddd',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	avatarText: {
		color: '#111',
		fontSize: 24,
		opacity: 0.55,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 20,
		paddingTop: 4,
	},
	action: {
		minWidth: 44,
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	greeting: {
		marginTop: 12,
		color: '#f5f5f5',
		fontSize: 32,
		fontWeight: '300',
	},
	name: {
		color: '#50d6ca',
	},
});
