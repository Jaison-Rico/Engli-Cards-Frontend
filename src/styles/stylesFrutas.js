import { StyleSheet } from 'react-native';

// Estilos de la pantalla del juego Frutas
// Mantén estos estilos como fuente única para esta pantalla
const stylesFrutas = StyleSheet.create({
	centerAligned: { alignItems: 'center' },
	screen: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
	counter: { color: '#111827', marginBottom: 12, fontWeight: '600' },
	dotsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 16 },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1', marginHorizontal: 4 },
	dotActive: { backgroundColor: '#3b82f6', width: 16 },
	controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	btn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
	btnDisabled: { backgroundColor: '#93c5fd' },
	btnText: { color: '#fff', fontWeight: '600' },
	audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginTop: 12 },
	audioText: { color: '#fff', fontWeight: '600' },
	cardContainer: {
		width: 400,
		height: 300,
		marginVertical: 12,
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
	},
	cardFront: {
		backgroundColor: '#3b82f6',
	},
	cardBack: {
		backgroundColor: '#10b981',
	},
	cardSubtitle: { position: 'absolute', top: 12, left: 12, color: 'rgba(255,255,255,0.9)', zIndex: 2 },
	cardText: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	cardHint: {
		color: 'rgba(255,255,255,0.7)',
		marginTop: 10,
	},
    cardImage: { 
        width: 200, 
        height: 150, 
        //marginVertical: -4, 
        resizeMode: 'contain',
    },
});

export default stylesFrutas;
