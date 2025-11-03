import { StyleSheet } from "react-native";
import theme, { tokens, shadows } from './theme';

// Estilos para la pantalla LearningPath
// Nota: Mantén este archivo como única fuente de estilos para esta pantalla.
// Evita duplicar definiciones y centraliza ajustes aquí.
const stylesLearningPath = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	listContent: {
		paddingVertical: 40,
		paddingHorizontal: 100,
	},
	itemContainer: {
		marginVertical: 15,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	node: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		// Sombras más pronunciadas
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 8,
	},
	completed: {
		backgroundColor: '#4CAF50',
		borderColor: '#45a049',
	},
	available: {
		backgroundColor: theme.colors.accent,
		borderColor: theme.colors.primary,
	},
	locked: {
		backgroundColor: '#d4d4d8',
		borderColor: '#a1a1aa',
	},
	text: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 13,
		textAlign: "center",
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	textLocked: {
		color: "#52525b",
	},
});

export default stylesLearningPath;
