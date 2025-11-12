import { StyleSheet } from 'react-native';
import theme, { tokens } from './theme';

// Estilos de la pantalla del juego Frutas
// Mantén estos estilos como fuente única para esta pantalla
const stylesFrutas = StyleSheet.create({
	centerAligned: { alignItems: 'center' },
	screen: {
		flex: 1,
		backgroundColor: theme.colors.background,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 24
	},
	counter: {
		color: theme.colors.foreground,
		marginBottom: 12,
		fontWeight: '600',
		opacity: 0.8,
		letterSpacing: 0.3
	},
	dotsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 12,
		marginBottom: 16
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.muted,
		marginHorizontal: 4
	},
	dotActive: {
		backgroundColor: theme.colors.accent,
		width: 10,
		height: 10
	},
	controls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12
	},
	btn: {
		flexDirection: 'row',
		alignItems: 'center', gap: 6,
		backgroundColor: theme.colors.accent, 
		paddingHorizontal: 16, 
		paddingVertical: 10, 
		borderRadius: tokens.radius.lg, 
		elevation: 2
	},
	btnDisabled: { 
		backgroundColor: theme.colors.secondary, 
		opacity: 0.6 
	},
	btnText: { 
		color: '#fff', 
		fontWeight: '700' },
	audioBtn: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		gap: 8, 
		backgroundColor: theme.colors.primary, paddingHorizontal: 16, 
		paddingVertical: 10, 
		borderRadius: 999, 
		marginTop: 12, 
		elevation: 3 
	},
	audioText: { 
		color: '#fff', fontWeight: '600' 
	},
	quizBtn: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'flex-end', 
		gap: 8, 
		backgroundColor: theme.colors.primary, 
		paddingHorizontal: 16, 
		paddingVertical: 10, 
		borderRadius: 999, 
		marginTop: 12, 
		elevation: 3, 
		left: 100, 
		top: -150 
	},
	cardContainer: { 
		width: '88%', 
		aspectRatio: 1.25, 
		maxWidth: 440, 
		marginVertical: 12 
	},
	card: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		backfaceVisibility: 'hidden',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		overflow: 'hidden',
	},
	cardFront: {
		backgroundColor: theme.colors.primary,
	},
	cardBack: {
		backgroundColor: theme.colors.accent,
	},
	badge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
	badgeText: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },
	cardText: {
		color: 'white',
		fontSize: 28,
		fontWeight: '800',
		marginBottom: 10,
	},
	cardHint: {
		color: 'rgba(255,255,255,0.7)',
		marginTop: 10,
		fontSize: 12,
	},
	cardImage: { width: '78%', height: '50%', resizeMode: 'contain', marginTop: 4 },
});

export default stylesFrutas;
