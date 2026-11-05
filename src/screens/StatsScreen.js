import React, { useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { ProgressChart, BarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAuth, getUserId } from '../context/AuthContext';
import { getUserStats, getQuizSessions } from '../services/users.service';
import { getDecks } from '../services/decks.service';
import { Layers, Layout, Clock, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { Card, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../context/ThemeContext';
import IconButton from '../components/ui/IconButton';
import { elevation } from '../theme/theme';

export default function StatsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { width: screenWidth } = useWindowDimensions();
  // Abierta desde Inicio (stack) muestra botón de volver; como pestaña no.
  const showBack = route.name === 'StatsScreen' && navigation.canGoBack();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  const primaryColor = theme.colors.primaryLight || theme.colors.primary;
  const cardColor = theme.colors.card;
  const bgLight = theme.colors.background;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (!userId) return;
        try {
          setIsLoading(true);
          const [statsResult, sessionsResult, decksData] = await Promise.all([
            getUserStats(userId),
            getQuizSessions(userId, 7),
            getDecks(userId, false),
          ]);
          if (isActive) {
            setStats(statsResult.data);
            setSessions(sessionsResult.data ?? []);
            const personalDecks = decksData.filter((d) => !d.is_system);
            setTotalDecks(personalDecks.length);
            setTotalCards(personalDecks.reduce((acc, deck) => acc + (deck.flashcards?.length || 0), 0));
          }
        } catch (error) {
          console.warn('No se pudieron cargar las estadísticas:', error?.message ?? error);
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
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const quizzesToday = sessions.filter((s) => s.completed_at.startsWith(todayStr)).length;
  const dailyGoalPercent = Math.min(quizzesToday / 3, 1);

  const totalAnswers = stats ? (stats.correct_answers_total + stats.wrong_answers_total) : 0;
  const dominionPercent = totalAnswers > 0 ? (stats.correct_answers_total / totalAnswers) : 0;
  const progressPercent = stats ? (100 - stats.next_level_points) / 100 : 0;
  const streakPercent = stats ? Math.min(stats.streak_current / 7, 1) : 0;

  const daysMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
  const last7DaysData = [0, 0, 0, 0, 0, 0, 0];
  const last7DaysLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysLabels.push(daysMap[d.getDay()]);
    const dateStr = d.toISOString().split('T')[0];
    last7DaysData[6 - i] = sessions.filter((s) => s.completed_at.startsWith(dateStr)).length;
  }

  const barData = { labels: last7DaysLabels, datasets: [{ data: last7DaysData }] };

  const totalSeconds = stats?.study_time_total_seconds || 0;
  const studyHours = Math.floor(totalSeconds / 3600);
  const studyMinutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center gap-1">
          {showBack ? (
            <IconButton accessibilityLabel="Volver" onPress={() => navigation.goBack()} className="-ml-3">
              <ArrowLeft color={theme.colors.foreground} size={22} />
            </IconButton>
          ) : null}
          <Typography type="h3" weight="bold" className="tracking-tight">Estadísticas</Typography>
        </View>

        {/* Circular Progress */}
        <View className="items-center justify-center h-[220px] mb-8">
          <View className="absolute items-center justify-center z-10">
            <Typography type="h1" weight="bold" className="text-accent" style={{ fontSize: 42 }}>
              {Math.round(dailyGoalPercent * 100)}%
            </Typography>
            <Typography type="body-sm" weight="semibold" className="text-accent -mt-1">Meta Diaria</Typography>
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
              color: () => primaryColor,
              labelColor: () => 'transparent',
            }}
            hideLegend
            style={{ position: 'absolute' }}
          />
        </View>

        {/* 3 Boxes */}
        <View className="flex-row justify-between mb-8 gap-2">
          {[
            { label: 'PROGRESO', value: `${Math.round(progressPercent * 100)}%` },
            { label: 'RACHA', value: `${Math.round(streakPercent * 100)}%` },
            { label: 'DOMINIO', value: `${Math.round(dominionPercent * 100)}%` },
          ].map((item) => (
            <View key={item.label} className="flex-1 items-center rounded-2xl border border-border bg-surface py-4" style={elevation(1, theme.mode)}>
              <Typography type="body-xs" weight="bold" color="muted" className="mb-1 uppercase tracking-wider">{item.label}</Typography>
              <Typography type="h4" weight="bold" className="text-accent">{item.value}</Typography>
            </View>
          ))}
        </View>

        {/* Weekly Activity */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Typography type="h5" weight="bold">Actividad Semanal</Typography>
            <Typography type="body-sm" weight="semibold" className="text-accent">Esta Semana</Typography>
          </View>
          <Card>
            <Card.Body className="py-3">
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
                  color: () => primaryColor,
                  labelColor: () => primaryColor,
                  barPercentage: 0.4,
                  barRadius: 6,
                }}
                style={{ borderRadius: 24, paddingRight: 0 }}
              />
            </Card.Body>
          </Card>
        </View>

        {/* Decks & Cards */}
        <View className="flex-row justify-between mb-5 gap-3">
          <Card className="flex-1">
            <Card.Body className="p-5">
              <View className="w-9 h-9 rounded-full bg-default items-center justify-center mb-4">
                <Layers color={primaryColor} size={20} />
              </View>
              <Typography type="h3" weight="bold" className="mb-1">{totalDecks}</Typography>
              <Typography type="body-sm" color="muted">Mazos creados</Typography>
            </Card.Body>
          </Card>
          <Card className="flex-1">
            <Card.Body className="p-5">
              <View className="w-9 h-9 rounded-full bg-default items-center justify-center mb-4">
                <Layout color={primaryColor} size={20} />
              </View>
              <Typography type="h3" weight="bold" className="mb-1">{totalCards}</Typography>
              <Typography type="body-sm" color="muted">Tarjetas totales</Typography>
            </Card.Body>
          </Card>
        </View>

        {/* Study Time Banner */}
        <View className="flex-row items-center rounded-3xl bg-accent p-6">
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center mr-4">
            <Clock color={theme.colors.onPrimary} size={24} />
          </View>
          <View className="flex-1">
            <Typography type="h4" weight="bold" className="text-accent-foreground mb-0.5">
              {studyHours}h {studyMinutes}m
            </Typography>
            <Typography type="body-sm" className="text-accent-foreground/70">Tiempo Estudiado</Typography>
          </View>
          <TrendingUp color="rgba(255,255,255,0.7)" size={24} />
        </View>
      </ScrollView>
    </View>
  );
}
