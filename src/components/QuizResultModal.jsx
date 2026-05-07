import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { tokens, shadows } from '../styles/theme';

export default function QuizResultModal({
	visible,
	score = 0,
	total = 0,
	onOk,
	title = 'Resultados',
	okText = 'OK',
	description,
	dismissible = false,
	onRequestClose
}) {
	const { theme } = useAppTheme();
	const styles = get_styles(theme);
	const message = description ?? `Has obtenido ${score} de ${total} respuestas correctas.`;

	const handleRequestClose = () => {
		if (onRequestClose) return onRequestClose();
		if (onOk) return onOk();
	};

	return (
		<Modal
			visible={!!visible}
			transparent
			animationType="fade"
			onRequestClose={handleRequestClose}
		>
			<View style={styles.backdrop} pointerEvents={visible ? 'auto' : 'none'}>
				<TouchableOpacity
					activeOpacity={1}
					style={styles.backdropTouch}
					onPress={dismissible ? handleRequestClose : undefined}
				>
					<TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
						<View style={styles.card}>
							<Text style={styles.title}>{title}</Text>
							<Text style={styles.message}>{message}</Text>
							<TouchableOpacity style={styles.okBtn} onPress={onOk}>
								<Text style={styles.okText}>{okText}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</View>
		</Modal>
	);
}

const get_styles = (theme) => StyleSheet.create({
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	backdropTouch: {
		flex: 1,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	},
	card: {
		width: '80%',
		backgroundColor: theme.colors.card,
		borderRadius: tokens.radius.lg,
		padding: tokens.spacing.lg,
		alignItems: 'center',
		...shadows.card
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		color: theme.colors.foreground,
		marginBottom: tokens.spacing.sm,
		textAlign: 'center'
	},
	message: {
		fontSize: 16,
		color: theme.colors.mutedForeground,
		textAlign: 'center',
		marginBottom: tokens.spacing.lg
	},
	okBtn: {
		backgroundColor: theme.colors.accent,
		borderRadius: tokens.radius.md,
		paddingVertical: 12,
		paddingHorizontal: 24
	},
	okText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 16
	}
});
