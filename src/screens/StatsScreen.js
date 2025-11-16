import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ProgressChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme, { tokens, shadows } from '../styles/theme';

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
	const insets = useSafeAreaInsets();
	const progressData = {
		labels: ["Progreso", "Racha", "Dominio"], 
		data: [0.8, 0.6, 0.4],
	};

	const barData = {
		labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
		datasets: [{ data: [2, 4, 3, 5, 1, 0, 3] }],
	};

	return (
		<ScrollView 
			style={styles.container}
			contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 80 }]}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.header}>
				<Text style={styles.title}>Estadísticas</Text>
				<Text style={styles.subtitle}>Resumen de tu progreso de aprendizaje</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Progreso General</Text>
				<View style={styles.chartContainer}>
					<ProgressChart
						data={progressData}
						width={screenWidth - 60}
						height={180}
						strokeWidth={12}
						radius={35}
						chartConfig={chartConfig}
						hideLegend={false}
						style={styles.chart}
					/>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Actividad Semanal</Text>
				<View style={styles.chartContainer}>
					<BarChart
						data={barData}
						width={screenWidth - 60}
						height={220}
						yAxisLabel=""
						chartConfig={chartConfig}
						verticalLabelRotation={0}
						style={styles.chart}
					/>
				</View>
			</View>

			<View style={styles.summaryBox}>
				<Text style={styles.summaryTitle}>Resumen</Text>
				<View style={styles.statRow}>
					<Text style={styles.statLabel}>Mazos creados</Text>
					<Text style={styles.statValue}>5</Text>
				</View>
				<View style={styles.divider} />
				<View style={styles.statRow}>
					<Text style={styles.statLabel}>Tarjetas estudiadas</Text>
					<Text style={styles.statValue}>110</Text>
				</View>
				<View style={styles.divider} />
				<View style={styles.statRow}>
					<Text style={styles.statLabel}>Nivel actual</Text>
					<Text style={styles.statValue}>Intermedio</Text>
				</View>
				<View style={styles.divider} />
				<View style={styles.statRow}>
					<Text style={styles.statLabel}>Racha de estudio</Text>
					<Text style={styles.statValue}>7 días</Text>
				</View>
			</View>
		</ScrollView>
	);
}

const chartConfig = {
	backgroundGradientFrom: theme.colors.card,
	backgroundGradientTo: theme.colors.card,
	decimalPlaces: 0,
	color: (opacity = 1) => `rgba(125, 202, 206, ${opacity})`,
	labelColor: (opacity = 1) => theme.colors.mutedForeground.replace('hsl', 'hsla').replace(')', `, ${opacity})`),
	style: { borderRadius: tokens.radius.md },
	propsForBackgroundLines: {
		strokeDasharray: "",
		stroke: theme.colors.border,
		strokeWidth: 1,
	},
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 24,
		borderBottomLeftRadius: tokens.radius.lg,
		borderBottomRightRadius: tokens.radius.lg,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "900",
		color: '#fff',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 13,
		color: 'rgba(255, 255, 255, 0.8)',
		fontWeight: "400",
		marginTop: 2,
	},
	section: {
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.foreground,
		marginBottom: 12,
	},
	chartContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: tokens.radius.lg,
		padding: 18,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...shadows.card,
	},
	chart: {
		marginVertical: 0,
		borderRadius: tokens.radius.md,
	},
	summaryBox: {
		marginHorizontal: 16,
		marginTop: 8,
		backgroundColor: theme.colors.card,
		borderRadius: tokens.radius.lg,
		padding: 18,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...shadows.card,
	},
	summaryTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.foreground,
		marginBottom: 16,
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	statLabel: {
		fontSize: 14,
		color: theme.colors.mutedForeground,
		fontWeight: "400",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.foreground,
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginVertical: 4,
	},
});
