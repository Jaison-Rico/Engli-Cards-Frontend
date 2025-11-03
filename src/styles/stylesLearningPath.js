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
		paddingHorizontal: 100, // Mover el padding aquí en lugar del container
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
		...shadows.card,
	},
	completed: { backgroundColor: '#4CAF50' },
	available: { backgroundColor: theme.colors.accent },
	locked: { backgroundColor: theme.colors.muted },
	text: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default stylesLearningPath;
