import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { View, FlatList, StatusBar, RefreshControl, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { AlertCircle, Layers2, Grid3x3, Timer, Library, Sparkles, GraduationCap, Crosshair } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getDecks } from '../services/decks.service';
import { getCurriculumMap } from '../services/curriculum.service';
import { getErrorMessage } from '../utils/errors';
import EmptyState from '../components/ui/EmptyState';
import PressableScale from '../components/ui/PressableScale';
import ModuleRoad, { sectionHeight, nodeLocalY } from '../components/path/ModuleRoad';
import PlanProgress from '../components/path/PlanProgress';
import PlanSheet from '../components/path/PlanSheet';
import TopFade from '../components/ui/TopFade';
import { PLAYABLE_LESSONS } from '../data/lessons';
import { elevation, shade } from '../theme/theme';
import { enterStagger } from '../theme/motion';

const SECTION_GAP = 0; // las secciones son contiguas para que el camino no se corte

const MINIGAMES = [
  { route: 'SwipeMode', title: 'Swipe', caption: '¿Es correcta?', icon: Layers2, pickSource: true },
  { route: 'MemoryMode', title: 'Memoria', caption: 'Encuentra pares', icon: Grid3x3, pickSource: true },
  { route: 'SurvivalMode', title: 'Contrarreloj', caption: 'Tus errores', icon: Timer, pickSource: false },
];

/** Tarjeta de minijuego: superficie neutra, icono en el color de marca. */
const MinigameCard = memo(function MinigameCard({ game, onPress, theme }) {
  const Icon = game.icon;
  return (
    <PressableScale
      onPress={() => onPress(game)}
      haptic="light"
      accessibilityLabel={`Minijuego ${game.title}`}
      className="flex-1 rounded-[20px] border border-border bg-surface p-3.5"
      style={elevation(1, theme.mode)}
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${theme.colors.primary}1A` }}>
        <Icon color={theme.colors.primary} size={20} strokeWidth={2.2} />
      </View>
      <Typography type="body-sm" weight="bold" numberOfLines={1}>{game.title}</Typography>
      <Typography type="body-xs" color="muted" numberOfLines={1}>{game.caption}</Typography>
    </PressableScale>
  );
});

export default function LearningPath() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { toast, actionSheet } = useFeedback();
  const listRef = useRef(null);
  const headerHeight = useRef(0);

  const [map, setMap] = useState(null);
  const [personalDecks, setPersonalDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);

  const load = useCallback(async (isActive = () => true) => {
    setError(null);
    try {
      // El mapa es local (SQLite): carga aunque no haya conexión.
      const nextMap = await getCurriculumMap(userId);
      if (!isActive()) return;
      setMap(nextMap);
      // Los mazos personales solo se usan en el selector de minijuegos.
      getDecks(userId, false)
        .then((decks) => { if (isActive()) setPersonalDecks(decks.filter((d) => !d.is_system)); })
        .catch(() => {});
    } catch (err) {
      if (isActive()) setError(getErrorMessage(err, 'No se pudo cargar tu mapa.'));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => { active = false; };
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const panelWidth = width - 32;
  const topPad = insets.top + 16;
  const modules = map?.modules ?? [];
  const itemHeights = useMemo(() => modules.map((m) => sectionHeight(m.nodes.length) + SECTION_GAP), [modules]);
  const currentModuleIndex = Math.max(modules.findIndex((m) => m.nodes.some((n) => n.status === 'current')), 0);

  /** Y global de inicio de cada módulo y hasta dónde llega el tramo recorrido. */
  const { offsets, progressY } = useMemo(() => {
    const acc = [];
    let y = 0;
    modules.forEach((m) => { acc.push(y); y += sectionHeight(m.nodes.length); });
    let py = 0;
    modules.forEach((m, i) => {
      const idx = m.nodes.findIndex((n) => n.status === 'current');
      if (idx >= 0) py = acc[i] + nodeLocalY(idx);
      else if (m.completed === m.nodes.length) py = acc[i] + nodeLocalY(m.nodes.length - 1);
    });
    return { offsets: acc, progressY: py };
  }, [modules]);

  /** Colores del camino, derivados solo de la paleta del tema. */
  const palette = useMemo(() => {
    const c = theme.colors;
    const dark = theme.mode === 'dark';
    return {
      mode: theme.mode,
      primary: c.primary,
      primaryDeep: shade(c.primary, -0.3),
      primarySoft: dark ? 'rgba(44,196,190,0.18)' : (c.primarySoft ?? '#E2F4F2'),
      onPrimary: c.onPrimary,
      ring: dark ? c.surface : '#FFFFFF',
      surface: c.surface,
      background: c.background,
      border: c.border,
      foreground: c.foreground,
      muted: c.muted,
      subtle: c.subtle,
      road: c.surface,
      roadEdge: dark ? 'rgba(255,255,255,0.07)' : c.border,
      roadDepth: dark ? 'rgba(0,0,0,0.45)' : shade('#E0EBEA', -0.08),
      lockedBase: dark ? '#0B1213' : shade('#E0EBEA', -0.1),
    };
  }, [theme]);

  const getItemLayout = useCallback((_, index) => {
    const offset = topPad + headerHeight.current + itemHeights.slice(0, index).reduce((a, b) => a + b, 0);
    return { length: itemHeights[index] ?? 0, offset, index };
  }, [itemHeights, topPad]);

  const scrollToCurrent = useCallback(() => {
    if (!modules.length) return;
    const offset = topPad + headerHeight.current + itemHeights.slice(0, currentModuleIndex).reduce((a, b) => a + b, 0);
    listRef.current?.scrollToOffset({ offset: Math.max(offset - 12, 0), animated: true });
  }, [modules.length, itemHeights, currentModuleIndex, topPad]);

  const openNode = useCallback((node) => {
    if (node.status === 'locked') {
      toast.info('Nodo bloqueado', { message: 'Completa el paso anterior para desbloquearlo.' });
      return;
    }
    const mod = modules.find((m) => m.id === node.moduleId);
    const label = `${mod?.title ?? ''} · ${node.title}`;
    const ref = { id: node.id, type: node.type, cards: node.cards };
    switch (node.type) {
      case 'flashcards':
        navigation.navigate('GameFlashCard', {
          sampleCards: node.cards.map((c) => ({ english: c.front, spanish: c.back })),
          deckName: label,
          node: { id: node.id, type: node.type },
        });
        break;
      case 'swipe':
        navigation.navigate('SwipeMode', { source: { type: 'cards', cards: node.cards }, sourceLabel: label, node: ref });
        break;
      case 'memory':
        navigation.navigate('MemoryMode', { source: { type: 'cards', cards: node.cards }, sourceLabel: label, node: ref });
        break;
      case 'boss':
        navigation.navigate('SurvivalMode', { sourceLabel: label, node: ref });
        break;
      default:
        break;
    }
  }, [modules, navigation, toast]);

  const openMinigame = (game) => {
    if (!game.pickSource) {
      navigation.navigate(game.route);
      return;
    }
    const go = (source, label) => navigation.navigate(game.route, { source, sourceLabel: label });
    const moduleCards = (mod) => mod.nodes[mod.nodes.length - 1].cards;
    actionSheet({
      title: `${game.title}: elige tus tarjetas`,
      options: [
        { label: 'Todo mezclado', icon: Sparkles, onPress: () => go({ type: 'all' }, 'Todo') },
        ...modules.map((mod) => ({
          label: `Módulo ${mod.index + 1} · ${mod.title}`,
          icon: GraduationCap,
          onPress: () => go({ type: 'cards', cards: moduleCards(mod) }, mod.title),
        })),
        ...PLAYABLE_LESSONS.map((l) => ({ label: `Lección · ${l.label}`, icon: l.icon, onPress: () => go({ type: 'lesson', name: l.name }, l.label) })),
        ...personalDecks.map((d) => ({ label: `Mazo · ${d.deck_name}`, icon: Library, onPress: () => go({ type: 'deck', deckId: d.deck_id }, d.deck_name) })),
      ],
    });
  };

  const renderModule = useCallback(({ item, index }) => (
    <View style={{ marginBottom: SECTION_GAP }}>
      <ModuleRoad
        module={item}
        width={panelWidth}
        offsetY={offsets[index] ?? 0}
        progressY={progressY}
        palette={palette}
        onPressNode={openNode}
      />
    </View>
  ), [panelWidth, openNode, offsets, progressY, palette]);

  const header = (
    <View onLayout={(e) => { headerHeight.current = e.nativeEvent.layout.height; }}>
      <Animated.View entering={enterStagger(0)} className="flex-row items-end justify-between px-1 pb-4 pt-2">
        <View>
          <Typography type="body-xs" weight="bold" color="muted" className="uppercase tracking-widest">Aprende jugando</Typography>
          <Typography type="h2" weight="bold" className="tracking-tight">Jugar</Typography>
        </View>
        {map ? (
          <PressableScale onPress={scrollToCurrent} haptic="light" accessibilityLabel="Ir a mi nodo actual" className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2">
            <Crosshair size={14} color={theme.colors.primary} />
            <Typography type="body-xs" weight="bold" style={{ color: theme.colors.primary }}>Mi nivel</Typography>
          </PressableScale>
        ) : null}
      </Animated.View>

      <Typography type="h5" weight="bold" className="mb-3 px-1">Minijuegos libres</Typography>
      <View className="mb-6 flex-row gap-3">
        {MINIGAMES.map((game) => <MinigameCard key={game.route} game={game} theme={theme} onPress={openMinigame} />)}
      </View>

      {map ? <PlanProgress map={map} onPressInfo={() => setPlanOpen(true)} /> : null}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <FlatList
        ref={listRef}
        data={loading || error ? [] : modules}
        keyExtractor={(m) => m.id}
        renderItem={renderModule}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={2}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: topPad, paddingBottom: 40, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
        ListHeaderComponent={header}
        ListEmptyComponent={() => {
          if (loading) return <View className="items-center py-16"><Spinner size="lg" /></View>;
          if (error) {
            return <EmptyState icon={AlertCircle} tone="danger" title="No pudimos cargar el mapa" description={error} actionLabel="Reintentar" onAction={() => { setLoading(true); load(); }} />;
          }
          return null;
        }}
      />
      <TopFade />
      <PlanSheet visible={planOpen} onClose={() => setPlanOpen(false)} map={map} />
    </View>
  );
}
