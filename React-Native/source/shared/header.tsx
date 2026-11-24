import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { nomeParaExibir, obterUsuario } from '../services/usuario';


type HeaderProps = {
	name?: string;
};

export default function Header({ name }: HeaderProps) {
	const [nomeDoUsuario, setNomeDoUsuario] = useState<string | null>(null);

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
					<Text accessibilityLabel="Ocultar saldo" style={styles.eye}>
						<Ionicons
							size={25}
							name='eye-outline'
							color={colors.primary}
						/>
					</Text>
					<Text accessibilityLabel="Configurações" style={styles.settings}>
						<Ionicons
							size={25}
							name='settings-outline'
							color={colors.primary}
						/>
					</Text>
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
	eye: {
		color: '#50d6ca',
		fontSize: 24,
		lineHeight: 58,
		fontWeight: '300',
	},
	settings: {
		color: '#50d6ca',
		fontSize: 24,
		lineHeight: 60,
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
