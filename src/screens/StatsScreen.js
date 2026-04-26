import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { ProgressChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme, { tokens, shadows } from '../styles/theme';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';
import { useFocusEffect } from '@react-navigation/native';
import { Layers, Layout, Clock, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
	const insets = useSafeAreaInsets();
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [totalDecks, setTotalDecks] = useState(0);
	const [totalCards, setTotalCards] = useState(0);

	const primaryColor = theme.colors.primaryLight || theme.colors.primary;
	const cardColor = theme.colors.card;
	const bgSecondary = theme.colors.surfaceContainerLow || '#CBEBE8';
	const bgLight = theme.colors.background;
	const textColor = theme.colors.foreground;

	useFocusEffect(
		React.useCallback(() => {
			let isActive = true;

			const fetchData = async () => {
				try {
					setIsLoading(true);
					const storedUser = await SecureStore.getItemAsync('userInfo');
					const token = await SecureStore.getItemAsync('token');
					if (!storedUser || !token) return;

					const user = JSON.parse(storedUser);
					const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
					if (!userId) return;

					const headers = { Authorization: `Bearer ${token}` };

					const [statsRes, sessionsRes, decksRes] = await Promise.all([
						fetch(`${config.BASE_URL}/users/${userId}/stats`, { headers }),
						fetch(`${config.BASE_URL}/users/${userId}/quiz-sessions?days=7`, { headers }),
						fetch(`${config.BASE_URL}/decks/${userId}`, { headers })
					]);

					if (isActive) {
						if (statsRes.ok) setStats(await statsRes.json());
						if (sessionsRes.ok) setSessions(await sessionsRes.json());
						if (decksRes.ok) {
							const decksData = await decksRes.json();
							setTotalDecks(decksData.length);
							const cardsCount = decksData.reduce((acc, deck) => acc + (deck.flashcards?.length || 0), 0);
							setTotalCards(cardsCount);
						}
					}
				} catch (error) {
					console.error("Error fetching stats data:", error);
				} finally {
					if (isActive) setIsLoading(false);
				}
			};

			fetchData();

			return () => { isActive = false; };
		}, [])
	);

	if (isLoading) {
		return (
			<View style={[styles.container, { backgroundColor: bgLight, justifyContent: 'center', alignItems: 'center' }]}>
				<ActivityIndicator size="large" color={primaryColor} />
			</View>
		);
	}

	// === Cálculos Dinámicos ===
	// Daily Goal: Asumimos meta diaria de 3 quizzes (hoy).
	const todayStr = new Date().toISOString().split('T')[0];
	const quizzesToday = sessions.filter(s => s.completed_at.startsWith(todayStr)).length;
	const dailyGoalPercent = Math.min(quizzesToday / 3, 1);

	// Dominio
	const totalAnswers = stats ? (stats.correct_answers_total + stats.wrong_answers_total) : 0;
	const dominionPercent = totalAnswers > 0 ? (stats.correct_answers_total / totalAnswers) : 0;

	// Progress general (Basado en nivel de puntos)
	const progressPercent = stats ? (100 - stats.next_level_points) / 100 : 0;

	// Racha
	const streakPercent = stats ? Math.min(stats.streak_current / 7, 1) : 0; // Porcentaje sobre meta de 7 días

	// Actividad Semanal
	const daysMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
	const last7DaysData = [0, 0, 0, 0, 0, 0, 0];
	const last7DaysLabels = [];
	
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		last7DaysLabels.push(daysMap[d.getDay()]);
		
		const dateStr = d.toISOString().split('T')[0];
		const daySessions = sessions.filter(s => s.completed_at.startsWith(dateStr));
		last7DaysData[6 - i] = daySessions.length;
	}

	const barData = {
		labels: last7DaysLabels,
		datasets: [{ data: last7DaysData }],
	};

	// Study Time
	const totalSeconds = stats?.study_time_total_seconds || 0;
	const studyHours = Math.floor(totalSeconds / 3600);
	const studyMinutes = Math.floor((totalSeconds % 3600) / 60);

	return (
		<ScrollView 
			style={[styles.container, { backgroundColor: bgLight }]}
			contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 80 }]}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: textColor }]}>Estadísticas</Text>
			</View>

			{/* Main Circular Progress */}
			<View style={styles.circleContainer}>
				<View style={styles.circleInnerContent}>
					<Text style={[styles.circlePercent, { color: primaryColor }]}>{Math.round(dailyGoalPercent * 100)}%</Text>
					<Text style={[styles.circleLabel, { color: primaryColor }]}>Meta Diaria</Text>
				</View>
				<ProgressChart
					data={{ data: [dailyGoalPercent] }}
					width={screenWidth}
					height={220}
					strokeWidth={20}
					radius={80}
					chartConfig={{
						backgroundGradientFrom: bgLight,
						backgroundGradientTo: bgLight,
						color: (opacity = 1) => primaryColor, 
						labelColor: () => 'transparent',
					}}
					hideLegend={true}
					style={{ position: 'absolute' }}
				/>
			</View>

			{/* 3 Horizontal Boxes */}
			<View style={styles.threeBoxesRow}>
				<View style={[styles.smallBox, { backgroundColor: cardColor, ...shadows.soft }]}>
					<Text style={[styles.smallBoxLabel, { color: theme.colors.mutedForeground }]}>PROGRESO</Text>
					<Text style={[styles.smallBoxValue, { color: primaryColor }]}>{Math.round(progressPercent * 100)}%</Text>
				</View>
				<View style={[styles.smallBox, { backgroundColor: cardColor, ...shadows.soft }]}>
					<Text style={[styles.smallBoxLabel, { color: theme.colors.mutedForeground }]}>RACHA</Text>
					<Text style={[styles.smallBoxValue, { color: primaryColor }]}>{Math.round(streakPercent * 100)}%</Text>
				</View>
				<View style={[styles.smallBox, { backgroundColor: cardColor, ...shadows.soft }]}>
					<Text style={[styles.smallBoxLabel, { color: theme.colors.mutedForeground }]}>DOMINIO</Text>
					<Text style={[styles.smallBoxValue, { color: primaryColor }]}>{Math.round(dominionPercent * 100)}%</Text>
				</View>
			</View>

			{/* Weekly Activity */}
			<View style={styles.weeklySection}>
				<View style={styles.weeklyHeader}>
					<Text style={[styles.weeklyTitle, { color: textColor }]}>Actividad Semanal</Text>
					<Text style={[styles.weeklySubtitle, { color: primaryColor }]}>Esta Semana</Text>
				</View>
				<View style={[styles.barChartContainer, { backgroundColor: cardColor, ...shadows.card }]}>
					<BarChart
						data={barData}
						width={screenWidth - 40}
						height={180}
						yAxisLabel=""
						withHorizontalLabels={false}
						withInnerLines={false}
						chartConfig={{
							backgroundGradientFrom: cardColor,
							backgroundGradientTo: cardColor,
							fillShadowGradientFrom: primaryColor,
							fillShadowGradientFromOpacity: 1,
							fillShadowGradientTo: primaryColor,
							fillShadowGradientToOpacity: 0.6,
							color: (opacity = 1) => primaryColor,
							labelColor: () => primaryColor,
							barPercentage: 0.4,
							barRadius: 6,
						}}
						style={styles.barChart}
					/>
				</View>
			</View>

			{/* Decks & Cards Row */}
			<View style={styles.twoBoxesRow}>
				<View style={[styles.mediumBox, { backgroundColor: cardColor, ...shadows.soft }]}>
					<View style={[styles.iconCircle, { backgroundColor: bgSecondary }]}>
						<Layers color={primaryColor} size={20} />
					</View>
					<Text style={[styles.mediumBoxValue, { color: textColor }]}>{totalDecks}</Text>
					<Text style={[styles.mediumBoxLabel, { color: theme.colors.mutedForeground }]}>Mazos creados</Text>
				</View>
				<View style={[styles.mediumBox, { backgroundColor: cardColor, ...shadows.soft }]}>
					<View style={[styles.iconCircle, { backgroundColor: bgSecondary }]}>
						<Layout color={primaryColor} size={20} />
					</View>
					<Text style={[styles.mediumBoxValue, { color: textColor }]}>{totalCards}</Text>
					<Text style={[styles.mediumBoxLabel, { color: theme.colors.mutedForeground }]}>Tarjetas totales</Text>
				</View>
			</View>

			{/* Study Time Banner */}
			<View style={[styles.timeBanner, { backgroundColor: primaryColor }]}>
				<View style={styles.timeIconWrap}>
					<Clock color="#FFF" size={24} />
				</View>
				<View style={styles.timeTextWrap}>
					<Text style={styles.timeValue}>{studyHours}h {studyMinutes}m</Text>
					<Text style={[styles.timeLabel, { color: bgSecondary }]}>Tiempo Estudiado</Text>
				</View>
				<TrendingUp color={bgSecondary} size={24} style={{ opacity: 0.8 }} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
	},
	circleContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 220,
		marginBottom: 30,
	},
	circleInnerContent: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 10,
	},
	circlePercent: {
		fontSize: 42,
		fontWeight: '900',
	},
	circleLabel: {
		fontSize: 14,
		fontWeight: '600',
		marginTop: -5,
	},
	threeBoxesRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	smallBox: {
		width: '31%',
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	smallBoxLabel: {
		fontSize: 10,
		fontWeight: '700',
		marginBottom: 6,
		letterSpacing: 0.5,
	},
	smallBoxValue: {
		fontSize: 20,
		fontWeight: '900',
	},
	weeklySection: {
		marginBottom: 30,
	},
	weeklyHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	weeklyTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	weeklySubtitle: {
		fontSize: 14,
		fontWeight: '600',
	},
	barChartContainer: {
		borderRadius: 24,
		paddingVertical: 10,
	},
	barChart: {
		borderRadius: 24,
		paddingRight: 0,
	},
	twoBoxesRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	mediumBox: {
		width: '48%',
		padding: 20,
		borderRadius: 24,
	},
	iconCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	mediumBoxValue: {
		fontSize: 24,
		fontWeight: '900',
		marginBottom: 4,
	},
	mediumBoxLabel: {
		fontSize: 13,
		fontWeight: '500',
	},
	timeBanner: {
		borderRadius: 24,
		padding: 24,
		flexDirection: 'row',
		alignItems: 'center',
	},
	timeIconWrap: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
	},
	timeTextWrap: {
		flex: 1,
	},
	timeValue: {
		fontSize: 20,
		fontWeight: '800',
		color: '#FFF',
		marginBottom: 2,
	},
	timeLabel: {
		fontSize: 13,
		fontWeight: '500',
	},
});
