import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useAuth, getUserId } from '../context/AuthContext';
import { getUserStats, getQuizSessions } from '../services/users.service';
import { getDecks } from '../services/decks.service';
import { Layers, Layout, Clock, ArrowLeft, Flame, Target, Trophy, Star } from 'lucide-react-native';
import { Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../context/ThemeContext';
import IconButton from '../components/ui/IconButton';
import { elevation } from '../theme/theme';
import GradientFill from '../components/ui/GradientFill';
import TopFade from '../components/ui/TopFade';
import { GlassBorder } from '../components/FlipCard';

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** Barra de progreso horizontal animada (de 0 al valor). */
function ProgressBar({ value, color, track, height = 10, delay = 0 }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(Math.max(0, Math.min(value || 0, 1)), { duration: 600, easing: EASE }));
  }, [value]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, style]} />
    </View>
  );
}

/** Barra vertical de la actividad semanal. */
function DayBar({ value, max, label, isToday, color, track, delay }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withTiming(max > 0 ? value / max : 0, { duration: 550, easing: EASE }));
  }, [value, max]);
  const style = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }));
  return (
    <View className="flex-1 items-center">
      <Typography type="body-xs" weight="bold" style={{ color: value > 0 ? color : 'transparent', marginBottom: 4 }}>{value}</Typography>
      <View style={{ height: 120, width: 22, borderRadius: 11, backgroundColor: track, justifyContent: 'flex-end', overflow: 'hidden' }}>
        <Animated.View style={[{ width: '100%', borderRadius: 11, backgroundColor: color, opacity: isToday ? 1 : 0.65 }, style]} />
      </View>
      <Typography type="body-xs" weight={isToday ? 'bold' : 'medium'} color={isToday ? undefined : 'muted'} className="mt-2" style={isToday ? { color } : null}>
        {label}
      </Typography>
    </View>
  );
}

export default function StatsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  // Abierta desde Inicio (stack) muestra botón de volver; como pestaña no.
  const showBack = route.name === 'StatsScreen' && navigation.canGoBack();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  const primaryColor = theme.colors.primary;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (!userId) return;
        try {
          // Sin spinner al volver a la pestaña: refresca en segundo plano.
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

  if (isLoading && !stats) {
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
  const streak = stats?.streak_current ?? 0;
  const best = stats?.streak_best ?? 0;
  const streakPercent = Math.min(streak / 7, 1);
  const level = stats?.level ?? 1;

  const daysMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    week.push({ label: daysMap[d.getDay()], value: sessions.filter((s) => s.completed_at.startsWith(dateStr)).length, isToday: i === 0 });
  }
  const weekMax = Math.max(...week.map((d) => d.value), 1);
  const weekTotal = week.reduce((a, d) => a + d.value, 0);

  const totalSeconds = stats?.study_time_total_seconds || 0;
  const studyHours = Math.floor(totalSeconds / 3600);
  const studyMinutes = Math.floor((totalSeconds % 3600) / 60);

  const track = theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(8,48,46,0.07)';
  const flame = theme.colors.flame || '#F97316';
  const gold = '#F5B301';
  const indigo = '#6366F1';
  const card = 'rounded-[24px] border border-border bg-surface';
  const shadow = elevation(1, theme.mode);
  const enter = (i) => FadeInDown.delay(i * 40).springify().damping(38).stiffness(360);

  const metrics = [
    { icon: Star, label: 'Nivel', caption: `${stats?.next_level_points ?? 100} pts para nivel ${level + 1}`, value: progressPercent, color: primaryColor },
    { icon: Target, label: 'Dominio', caption: `${stats?.correct_answers_total ?? 0} de ${totalAnswers} respuestas correctas`, value: dominionPercent, color: indigo },
    { icon: Flame, label: 'Racha semanal', caption: `${streak} de 7 días`, value: streakPercent, color: flame },
  ];

  const IconTile = ({ icon: Icon, color, size = 40 }) => (
    <View className="mb-3 items-center justify-center rounded-[14px]" style={{ width: size, height: size, backgroundColor: `${color}1A` }}>
      <Icon color={color} size={20} />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center gap-1">
          {showBack ? (
            <IconButton accessibilityLabel="Volver" onPress={() => navigation.goBack()} className="-ml-3">
              <ArrowLeft color={theme.colors.foreground} size={22} />
            </IconButton>
          ) : null}
          <View>
            <Typography type="body-xs" weight="bold" color="muted" className="uppercase tracking-widest">Tu progreso</Typography>
            <Typography type="h2" weight="bold" className="tracking-tight">Estadísticas</Typography>
          </View>
        </View>

        {/* Hero: nivel, puntos y racha */}
        <Animated.View
          entering={enter(0)}
          className="mb-4 overflow-hidden rounded-[28px] px-5 pb-5 pt-6"
          style={[{ backgroundColor: primaryColor }, elevation(2, theme.mode)]}
        >
          {/* Mismo lenguaje que el Perfil: degradado + borde fino, texto directo sobre el fondo */}
          <GradientFill colors={['#17B3AD', primaryColor, '#07726E']} radius={28} sheen />
          <GlassBorder radius={28} color="rgba(255,255,255,0.22)" />
          <View className="flex-row items-end justify-between">
            <View>
              <Typography type="body-sm" weight="semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>Nivel actual</Typography>
              <Typography weight="bold" style={{ color: '#fff', fontSize: 52, lineHeight: 58 }}>{level}</Typography>
            </View>
            <View className="items-end pb-2">
              <View className="flex-row items-center gap-1.5">
                <Flame color="#FFD27A" size={20} fill="#FFB020" />
                <Typography weight="bold" style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>{streak}</Typography>
              </View>
              <Typography type="body-xs" weight="medium" style={{ color: 'rgba(255,255,255,0.82)' }}>{streak === 1 ? 'día de racha' : 'días de racha'}</Typography>
            </View>
          </View>
          <View className="mt-4">
            <View className="mb-2 flex-row justify-between">
              <Typography type="body-xs" weight="semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{stats?.points_total ?? 0} pts</Typography>
              <Typography type="body-xs" weight="semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{Math.round(progressPercent * 100)}%</Typography>
            </View>
            <ProgressBar value={progressPercent} color="#fff" track="rgba(255,255,255,0.22)" height={8} delay={200} />
          </View>
        </Animated.View>

        {/* Meta diaria + mejor racha */}
        <Animated.View entering={enter(1)} className="mb-4 flex-row gap-3">
          <View className={`flex-1 p-4 ${card}`} style={shadow}>
            <IconTile icon={Target} color={primaryColor} />
            <Typography type="h3" weight="bold">{quizzesToday}<Typography type="body-sm" color="muted"> / 3</Typography></Typography>
            <Typography type="body-xs" color="muted" className="mb-3">Meta diaria de quizzes</Typography>
            <ProgressBar value={dailyGoalPercent} color={primaryColor} track={track} height={6} delay={300} />
          </View>
          <View className={`flex-1 p-4 ${card}`} style={shadow}>
            <IconTile icon={Trophy} color={gold} />
            <Typography type="h3" weight="bold">{best}<Typography type="body-sm" color="muted"> días</Typography></Typography>
            <Typography type="body-xs" color="muted" className="mb-3">Mejor racha</Typography>
            <ProgressBar value={best > 0 ? streak / best : 0} color={gold} track={track} height={6} delay={350} />
          </View>
        </Animated.View>

        {/* Rendimiento */}
        <Animated.View entering={enter(2)} className={`mb-4 p-5 ${card}`} style={shadow}>
          <Typography type="h5" weight="bold" className="mb-4">Rendimiento</Typography>
          {metrics.map((m, i) => (
            <View key={m.label} className={i < metrics.length - 1 ? 'mb-5' : ''}>
              <View className="mb-2 flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${m.color}1A` }}>
                  <m.icon color={m.color} size={17} />
                </View>
                <View className="flex-1">
                  <Typography type="body-sm" weight="semibold">{m.label}</Typography>
                  <Typography type="body-xs" color="muted">{m.caption}</Typography>
                </View>
                <Typography type="h5" weight="bold" style={{ color: m.color }}>{Math.round(m.value * 100)}%</Typography>
              </View>
              <ProgressBar value={m.value} color={m.color} track={track} delay={120 + i * 70} />
            </View>
          ))}
        </Animated.View>

        {/* Actividad semanal */}
        <Animated.View entering={enter(3)} className={`mb-4 p-5 ${card}`} style={shadow}>
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Typography type="h5" weight="bold">Actividad semanal</Typography>
              <Typography type="body-xs" color="muted">Quizzes completados por día</Typography>
            </View>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${primaryColor}1A` }}>
              <Typography type="body-xs" weight="bold" style={{ color: primaryColor }}>{weekTotal} esta semana</Typography>
            </View>
          </View>
          <View className="flex-row">
            {week.map((d, i) => (
              <DayBar key={i} {...d} max={weekMax} color={primaryColor} track={track} delay={150 + i * 40} />
            ))}
          </View>
        </Animated.View>

        {/* Mazos y tarjetas */}
        <Animated.View entering={enter(4)} className="mb-4 flex-row gap-3">
          {[
            { icon: Layers, value: totalDecks, label: 'Mazos creados' },
            { icon: Layout, value: totalCards, label: 'Tarjetas totales' },
          ].map((it) => (
            <View key={it.label} className={`flex-1 p-4 ${card}`} style={shadow}>
              <IconTile icon={it.icon} color={primaryColor} />
              <Typography type="h3" weight="bold">{it.value}</Typography>
              <Typography type="body-xs" color="muted">{it.label}</Typography>
            </View>
          ))}
        </Animated.View>

        {/* Tiempo de estudio */}
        <Animated.View entering={enter(5)} className={`flex-row items-center p-5 ${card}`} style={shadow}>
          <View className="mr-4 h-12 w-12 items-center justify-center rounded-[16px]" style={{ backgroundColor: `${indigo}1A` }}>
            <Clock color={indigo} size={22} />
          </View>
          <View className="flex-1">
            <Typography type="body-xs" weight="bold" color="muted" className="uppercase tracking-wider">Tiempo estudiado</Typography>
            <Typography type="h3" weight="bold">
              {studyHours}<Typography type="body-sm" color="muted">h </Typography>
              {studyMinutes}<Typography type="body-sm" color="muted">m</Typography>
            </Typography>
          </View>
          <View className="items-end">
            <Typography type="h5" weight="bold">{stats?.quizzes_completed ?? 0}</Typography>
            <Typography type="body-xs" color="muted">quizzes</Typography>
          </View>
        </Animated.View>
      </ScrollView>
      <TopFade />
    </View>
  );
}
