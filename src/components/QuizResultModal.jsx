import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { tokens, shadows } from '../styles/theme';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function QuizResultModal({
	visible,
	score = 0,
	total = 0,
	onOk,
	onReview,
	hasFailed = false,
	title = '¡Quiz Completado!',
	okText = 'Continuar',
	description,
	dismissible = false,
	onRequestClose
}) {
	const { theme } = useAppTheme();
	const styles = get_styles(theme);
	const isPerfect = score === total && total > 0;
	const message = description ?? `Has obtenido ${score} de ${total} respuestas correctas. ${isPerfect ? '¡Excelente trabajo!' : ''}`;

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
					<TouchableOpacity activeOpacity={1} onPress={() => {}}>
						<View style={styles.card}>
							<Text style={styles.title}>{isPerfect ? '🏆 ¡Perfecto!' : title}</Text>
							<Text style={styles.message}>{message}</Text>
							
							<View style={{ width: '100%', gap: 10 }}>
								<TouchableOpacity 
									style={styles.okBtn} 
									onPress={onOk}
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<Text style={styles.okText}>{okText}</Text>
								</TouchableOpacity>

								{!isPerfect && hasFailed && (
									<TouchableOpacity 
										style={[styles.okBtn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.accent }]} 
										onPress={onReview}
										hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
									>
										<Text style={[styles.okText, { color: theme.colors.accent }]}>Repasar Errores</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>

				{isPerfect && (
					<LottieView
						source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_u4y3uoxk.json' }}
						autoPlay
						loop={false}
						style={{
							position: 'absolute',
							width: width,
							height: height,
							zIndex: -1, // Lo ponemos detrás por si acaso bloquea, o simplemente lo movemos al final
							pointerEvents: 'none',
						}}
					/>
				)}
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
