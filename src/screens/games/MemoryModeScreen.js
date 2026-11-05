import React, { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from 'heroui-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';
import GameScaffold from '../../components/games/GameScaffold';
import useGameSession, { poolLoader, nodeResultNote } from '../../components/games/useGameSession';
import FlipCard, { GlassBorder } from '../../components/FlipCard';
import GradientFill from '../../components/ui/GradientFill';
import QuizResultModal from '../../components/QuizResultModal';
import { useAppTheme } from '../../context/ThemeContext';
import { shuffle } from '../../services/learning.service';
import { speak } from '../../services/tts';
import SoundManager from '../../config/sounds';
import { DURATION } from '../../theme/motion';

const MAX_PAIRS = 6;
const MIN_PAIRS = 3;
const COLUMNS = 3;
const GAP = 10;
const MISMATCH_DELAY = 800;

/* ------------------------------ Estado ------------------------------ */

/**
 * Reductor puro del tablero. `locked` bloquea toques mientras dos tarjetas
 * distintas esperan a voltearse (evita voltear una tercera en ese lapso).
 */
const initialState = { tiles: [], open: [], matched: [], moves: 0, locked: false };

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return { ...initialState, tiles: action.tiles };
    case 'open': {
      if (state.locked || state.open.includes(action.id)) return state;
      const tile = state.tiles.find((t) => t.id === action.id);
      if (!tile || state.matched.includes(tile.pairKey)) return state;
      const open = [...state.open, action.id];
      if (open.length < 2) return { ...state, open };
      return { ...state, open, moves: state.moves + 1, locked: true };
    }
    case 'match':
      return { ...state, matched: [...state.matched, action.pairKey], open: [], locked: false };
    case 'close':
      return { ...state, open: [], locked: false };
    default:
      return state;
  }
}

/** Dos fichas por tarjeta: una en inglés y otra en español. */
const buildTiles = (cards) =>
  shuffle(
    cards.flatMap((card) => [
      { id: `${card.key}#en`, pairKey: card.key, text: card.front, lang: 'en', card },
      { id: `${card.key}#es`, pairKey: card.key, text: card.back, lang: 'es', card },
    ]),
  );

/* ------------------------------ Ficha ------------------------------- */

const Tile = memo(function Tile({ tile, size, isOpen, isMatched, onPress }) {
  const pulse = useSharedValue(1);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (!isMatched) return;
    // Pequeño "latido" al acertar y luego queda atenuada.
    pulse.value = withSequence(withTiming(1.07, { duration: 140 }), withTiming(1, { duration: 160 }));
    fade.value = withTiming(0.55, { duration: 400 });
  }, [isMatched]);

  const style = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ scale: pulse.value }] }));
  const isEn = tile.lang === 'en';

  return (
    <Animated.View style={style}>
      <FlipCard
        flipped={isOpen || isMatched}
        onPress={() => onPress(tile)}
        disabled={isMatched}
        width={size}
        height={size}
        radius={20}
        pressScale={0.95}
        duration={DURATION.flip - 60}
        shadowStrength={0.55}
        plateColor={isEn ? '#0B8C88' : '#4A5BD4'}
        accessibilityLabel={isOpen || isMatched ? tile.text : 'Tarjeta oculta'}
        front={(
          <View style={[styles.face, { width: size, height: size }]}>
            <GradientFill colors={['#F59E0B', '#D97706']} radius={20} sheen />
            <GlassBorder radius={20} />
            <View style={styles.pattern}><Sparkles color="rgba(255,255,255,0.9)" size={size * 0.28} /></View>
          </View>
        )}
        back={(
          <View style={[styles.face, { width: size, height: size }]}>
            <GradientFill colors={isEn ? ['#17B3AD', '#07726E'] : ['#6474F0', '#3443B5']} radius={20} sheen />
            <GlassBorder radius={20} />
            <Typography type="body-xs" weight="bold" style={styles.lang}>{isEn ? 'EN' : 'ES'}</Typography>
            <Typography
              type="body"
              weight="bold"
              align="center"
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={{ color: '#fff', paddingHorizontal: 8 }}
            >
              {tile.text}
            </Typography>
          </View>
        )}
      />
    </Animated.View>
  );
});

/* ------------------------------ Pantalla ---------------------------- */

export default function MemoryModeScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { theme } = useAppTheme();
  const { width: screenW } = useWindowDimensions();
  const session = useGameSession(poolLoader(params?.source, MAX_PAIRS, shuffle), { node: params?.node });
  const [state, dispatch] = useReducer(reducer, initialState);
  const timer = useRef(null);
  const finished = useRef(false);

  const pairs = session.cards.length;

  useEffect(() => {
    finished.current = false;
    dispatch({ type: 'reset', tiles: buildTiles(session.cards) });
  }, [session.cards]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Evalúa el par cuando hay dos fichas abiertas.
  useEffect(() => {
    if (state.open.length !== 2) return;
    const [a, b] = state.open.map((id) => state.tiles.find((t) => t.id === id));
    if (a.pairKey === b.pairKey) {
      session.answer(a.card, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      SoundManager.play('correct');
      // Deja ver el par un instante antes de marcarlo.
      timer.current = setTimeout(() => dispatch({ type: 'match', pairKey: a.pairKey }), DURATION.flip);
    } else {
      // El error se atribuye a la primera ficha: era la que se intentaba emparejar.
      session.answer(a.card, false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      timer.current = setTimeout(() => dispatch({ type: 'close' }), MISMATCH_DELAY);
    }
  }, [state.open]);

  // Fin de partida: precisión = pares / intentos.
  useEffect(() => {
    if (pairs > 0 && state.matched.length === pairs && !finished.current) {
      finished.current = true;
      SoundManager.play('success');
      session.finish(pairs, Math.max(state.moves, pairs));
    }
  }, [state.matched.length, pairs]);

  const handlePress = useCallback((tile) => {
    Haptics.selectionAsync().catch(() => {});
    speak(tile.text, { lang: tile.lang, rate: 0.95 });
    dispatch({ type: 'open', id: tile.id });
  }, []);

  const size = useMemo(() => Math.floor((Math.min(screenW, 460) - 32 - GAP * (COLUMNS - 1)) / COLUMNS), [screenW]);
  const openSet = new Set(state.open);
  const matchedSet = new Set(state.matched);

  return (
    <GameScaffold
      title="Modo Memoria"
      subtitle={params?.sourceLabel ?? 'Todo mezclado'}
      onBack={() => navigation.goBack()}
      loading={session.loading}
      error={session.error}
      onRetry={session.reload}
      empty={!session.loading && pairs < MIN_PAIRS}
      emptyText={`Necesitas al menos ${MIN_PAIRS} tarjetas. Elige otra lección o mazo.`}
    >
      <View className="mx-4 mb-4 mt-1 flex-row gap-3">
        {[
          { label: 'Pares', value: `${state.matched.length}/${pairs}` },
          { label: 'Intentos', value: state.moves },
        ].map((s) => (
          <View key={s.label} className="flex-1 flex-row items-center justify-between rounded-[18px] border border-border bg-surface px-4 py-3">
            <Typography type="body-xs" weight="semibold" color="muted" className="uppercase tracking-wider">{s.label}</Typography>
            <Typography type="h5" weight="bold" style={{ color: theme.colors.primary }}>{s.value}</Typography>
          </View>
        ))}
      </View>

      <View className="flex-1 items-center justify-center">
        <View style={{ width: size * COLUMNS + GAP * (COLUMNS - 1), flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
          {state.tiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              size={size}
              isOpen={openSet.has(tile.id)}
              isMatched={matchedSet.has(tile.pairKey)}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>

      <QuizResultModal
        visible={Boolean(session.result)}
        score={session.result?.correct ?? 0}
        total={session.result?.total ?? 0}
        title="¡Tablero completado!"
        description={`Encontraste ${pairs} pares en ${state.moves} intentos.${nodeResultNote(session.result?.passed)}`}
        savedOffline={session.result?.savedOffline}
        achievement={session.result?.achievement}
        okText="Salir"
        secondaryText="Jugar otra vez"
        onOk={() => navigation.goBack()}
        onReview={session.reload}
      />
    </GameScaffold>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pattern: { opacity: 0.95 },
  lang: { position: 'absolute', top: 8, left: 10, color: 'rgba(255,255,255,0.75)', fontSize: 10, letterSpacing: 0.8 },
});
