import { StyleSheet } from "react-native";

// Estilos para la pantalla LearningPath
// Nota: Mantén este archivo como única fuente de estilos para esta pantalla.
// Evita duplicar definiciones y centraliza ajustes aquí.
const stylesLearningPath = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
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
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 5,
	},
	completed: { backgroundColor: "#4CAF50" },
	available: { backgroundColor: "#FFC107" },
	locked: { backgroundColor: "#E0E0E0" },
	text: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default stylesLearningPath;
