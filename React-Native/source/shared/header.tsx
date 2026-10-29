import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type HeaderProps = {
	name?: string;
};

export default function Header({name = 'Usuario'}: HeaderProps) {
	return (
		<View style={styles.header}>
			<View style={styles.topRow}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>F</Text>
				</View>

				<View style={styles.actions}>
					<Text accessibilityLabel="Ocultar saldo" style={styles.eye}>
						Eye
					</Text>
					<Text accessibilityLabel="Configurações" style={styles.settings}>
                        Settings
					</Text>
				</View>
			</View>

			<Text style={styles.greeting}>
				Olá, <Text style={styles.name}>{name}</Text>
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flex: 0,
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
