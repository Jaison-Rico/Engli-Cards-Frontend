import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  interpolateColor,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { Heart, Skull, Zap, Play } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GameScaffold from '../../components/games/GameScaffold';
import useGameSession, { nodeResultNote } from '../../components/games/useGameSession';
import QuizResultModal from '../../components/QuizResultModal';
import PressableScale from '../../components/ui/PressableScale';
import GradientFill from '../../components/ui/GradientFill';
import { GlassBorder } from '../../components/FlipCard';
import { useAppTheme } from '../../context/ThemeContext';
import { getSurvivalDeck, shuffle } from '../../services/learning.service';
import { speak } from '../../services/tts';
import SoundManager from '../../config/sounds';
import { EASE } from '../../theme/motion';
import { elevation } from '../../theme/theme';

const LIVES = 3;
const BASE_MS = 6000;
const MIN_MS = 2600;
const STEP_MS = 220; // cada acierto consecutivo acorta el tiempo
const DECK_SIZE = 30;

const timeFor = (combo) => Math.max(MIN_MS, BASE_MS - combo * STEP_MS);

/** 1 correcta + 3 distractores, sin repetir textos. */
const buildOptions = (card, deck) => {
  const pool = shuffle(deck.filter((c) => c.key !== card.key && c.back.toLowerCase() !== card.back.toLowerCase()));
  const seen = new Set([card.back.toLowerCase()]);
  const decoys = [];
  for (const c of pool) {
    if (decoys.length === 3) break;
    if (!seen.has(c.back.toLowerCase())) { seen.add(c.back.toLowerCase()); decoys.push(c.back); }
  }
  return shuffle([card.back, ...decoys]);
};

/**
 * Supervivencia (contrarreloj contra "el jefe"):
 *  - Las tarjetas salen de SQLite ordenadas por tasa de error (las más
 *    difíciles primero); si faltan, se completa con tarjetas al azar.
 *  - La barra de tiempo es un shared value animado con withTiming lineal en el
 *    hilo de UI: no provoca renders por frame. Cuando llega a 0, el callback
 *    de la animación avisa a JS una sola vez (scheduleOnRN).
 *  - Cada acierto suma combo y acorta el tiempo; fallo o tiempo agotado
 *    quitan una vida. Con 0 vidas termina la partida.
 */
export default function SurvivalModeScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const node = params?.node ?? null;
  const { theme } = useAppTheme();
  const meta = useRef({ fromErrors: 0 });
  const session = useGameSession(async (userId) => {
    // Jefe de módulo: solo las tarjetas del módulo, las más falladas primero.
    const source = node ? { type: 'cards', cards: node.cards } : null;
    const { cards, fromErrors } = await getSurvivalDeck(userId, DECK_SIZE, source);
    meta.current.fromErrors = fromErrors;
    return cards;
  }, { node });
  const deck = session.cards;

  const [phase, setPhase] = useState('intro'); // intro | playing | over
  const [order, setOrder] = useState([]);
  const [turn, setTurn] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState(null); // { option, correct }
  const answered = useRef(0);
  const mounted = useRef(true);
  const time = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => () => { mounted.current = false; cancelAnimation(time); }, []);

  const card = order.length ? order[turn % order.length] : null;
  const options = useMemo(() => (card ? buildOptions(card, deck) : []), [card, deck]);

  const startTimer = useCallback((ms) => {
    cancelAnimation(time);
    time.value = 1;
    time.value = withTiming(0, { duration: ms, easing: EASE.linear }, (finished) => {
      if (finished) scheduleOnRN(onTimeout);
    });
  }, []);

  const endGame = (finalScore) => {
    cancelAnimation(time);
    setPhase('over');
    SoundManager.play(finalScore > 0 ? 'success' : 'wrong');
    session.finish(finalScore, Math.max(answered.current, 1));
  };

  const nextTurn = (newCombo) => {
    setPicked(null);
    setTurn((t) => t + 1);
    startTimer(timeFor(newCombo));
  };

  const loseLife = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }), withTiming(0, { duration: 50 }),
    );
    return lives - 1;
  };

  // Referencia estable para el callback del worklet (siempre lee el estado actual).
  const timeoutRef = useRef(() => {});
  timeoutRef.current = () => {
    if (!mounted.current || phase !== 'playing' || picked) return;
    answered.current += 1;
    session.answer(card, false);
    SoundManager.play('wrong');
    const left = loseLife();
    setLives(left);
    setCombo(0);
    setPicked({ option: null, correct: false });
    setTimeout(() => {
      if (!mounted.current) return;
      if (left <= 0) endGame(score);
      else nextTurn(0);
    }, 700);
  };
  function onTimeout() { timeoutRef.current(); }

  const handlePick = (option) => {
    if (picked || phase !== 'playing') return;
    cancelAnimation(time);
    answered.current += 1;
    const correct = option === card.back;
    session.answer(card, correct);
    setPicked({ option, correct });
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      SoundManager.play('correct');
      const newScore = score + 1;
      const newCombo = combo + 1;
      setScore(newScore);
      setCombo(newCombo);
      setTimeout(() => mounted.current && nextTurn(newCombo), 450);
    } else {
      SoundManager.play('wrong');
      const left = loseLife();
      setLives(left);
      setCombo(0);
      setTimeout(() => {
        if (!mounted.current) return;
        if (left <= 0) endGame(score);
        else nextTurn(0);
      }, 900);
    }
  };

  const start = () => {
    setOrder(deck);
    setTurn(0);
    setLives(LIVES);
    setScore(0);
    setCombo(0);
    setPicked(null);
    answered.current = 0;
    setPhase('playing');
    startTimer(timeFor(0));
  };

  const restart = async () => {
    setPhase('intro');
    await session.reload();
  };

  // Pronuncia cada palabra nueva en inglés.
  useEffect(() => { if (phase === 'playing' && card) speak(card.front, { lang: 'en' }); }, [phase, turn]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${time.value * 100}%`,
    backgroundColor: interpolateColor(time.value, [0, 0.3, 0.6, 1], ['#F43F5E', '#F97316', '#F5B301', '#10B981']),
  }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const hearts = (
    <View className="flex-row gap-1">
      {Array.from({ length: LIVES }, (_, i) => (
        <Heart key={i} size={20} color="#F43F5E" fill={i < lives ? '#F43F5E' : 'transparent'} strokeWidth={2.2} />
      ))}
    </View>
  );

  return (
    <GameScaffold
      title={node ? 'Jefe del módulo' : 'Supervivencia'}
      subtitle={params?.sourceLabel ?? 'Tus palabras más difíciles'}
      onBack={() => navigation.goBack()}
      loading={session.loading}
      error={session.error}
      onRetry={session.reload}
      empty={!session.loading && deck.length < 4}
      emptyText="Necesitas al menos 4 tarjetas para enfrentar al jefe."
      right={phase === 'playing' ? hearts : null}
    >
      {phase === 'intro' ? (
        <Animated.View entering={FadeInDown.springify().damping(38).stiffness(360)} className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-28 w-28 items-center justify-center overflow-hidden rounded-[36px]" style={elevation(3)}>
            <GradientFill colors={['#F43F5E', '#9F1239']} radius={36} sheen />
            <Skull color="#fff" size={56} strokeWidth={2} />
          </View>
          <Typography type="h3" weight="bold" align="center">Ronda del jefe</Typography>
          <Typography type="body-sm" color="muted" align="center" className="mb-6 mt-2 max-w-[300px] leading-5">
            {meta.current.fromErrors > 0
              ? `${meta.current.fromErrors} de estas palabras son las que más fallas. Responde antes de que se acabe el tiempo.`
              : 'Aún no tienes errores registrados: te enfrentarás a palabras al azar. ¡Juega más para afinar al jefe!'}
          </Typography>
          <View className="mb-8 flex-row gap-3">
            {[{ icon: Heart, text: `${LIVES} vidas` }, { icon: Zap, text: 'Cada vez más rápido' }].map((it) => (
              <View key={it.text} className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2">
                <it.icon size={14} color="#F43F5E" />
                <Typography type="body-xs" weight="semibold">{it.text}</Typography>
              </View>
            ))}
          </View>
          <PressableScale onPress={start} haptic="medium" accessibilityLabel="Empezar" className="h-14 w-full max-w-[320px] flex-row items-center justify-center gap-2 overflow-hidden rounded-[18px]" style={elevation(2)}>
            <GradientFill colors={['#F43F5E', '#BE123C']} radius={18} />
            <Play color="#fff" size={18} fill="#fff" />
            <Typography type="body" weight="bold" style={{ color: '#fff' }}>Empezar</Typography>
          </PressableScale>
        </Animated.View>
      ) : card ? (
        <View className="flex-1 px-5">
          {/* Barra de tiempo */}
          <View className="mt-1 h-3 overflow-hidden rounded-full bg-default">
            <Animated.View style={[{ height: '100%', borderRadius: 999 }, barStyle]} />
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Typography type="body-sm" weight="bold">{score} <Typography type="body-sm" color="muted">aciertos</Typography></Typography>
            {combo >= 2 ? (
              <Animated.View key={combo} entering={FadeIn.duration(140)} className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: '#F5B30122' }}>
                <Zap size={13} color="#D97706" fill="#F5B301" />
                <Typography type="body-xs" weight="bold" style={{ color: '#B45309' }}>Combo x{combo}</Typography>
              </Animated.View>
            ) : null}
          </View>

          {/* Palabra */}
          <Animated.View key={turn} entering={FadeInDown.springify().damping(38).stiffness(360)} style={[styles.wordCard, elevation(2, theme.mode), shakeStyle]}>
            <GradientFill colors={['#2B2F4A', '#151827']} radius={28} sheen />
            <GlassBorder radius={28} color="rgba(255,255,255,0.14)" />
            <Typography type="body-xs" weight="bold" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2 }}>TRADUCE</Typography>
            <Typography type="h2" weight="bold" align="center" numberOfLines={2} adjustsFontSizeToFit style={{ color: '#fff', marginTop: 6 }}>
              {card.front}
            </Typography>
          </Animated.View>

          {/* Opciones */}
          <View className="gap-2.5">
            {options.map((option) => {
              const isAnswer = option === card.back;
              const isPicked = picked?.option === option;
              const reveal = Boolean(picked);
              const bg = reveal && isAnswer ? '#10B981' : reveal && isPicked ? '#F43F5E' : theme.colors.surface;
              const fg = reveal && (isAnswer || isPicked) ? '#fff' : theme.colors.foreground;
              return (
                <PressableScale
                  key={option}
                  onPress={() => handlePick(option)}
                  disabled={reveal}
                  haptic={null}
                  accessibilityLabel={option}
                  className="min-h-[56px] justify-center rounded-[18px] border border-border px-5 py-3.5"
                  style={[{ backgroundColor: bg }, elevation(1, theme.mode)]}
                >
                  <Typography type="body" weight="semibold" numberOfLines={2} style={{ color: fg }}>{option}</Typography>
                </PressableScale>
              );
            })}
          </View>
        </View>
      ) : null}

      <QuizResultModal
        visible={phase === 'over' && Boolean(session.result)}
        score={session.result?.correct ?? 0}
        total={session.result?.total ?? 0}
        title={session.result?.passed ? '¡Derrotaste al jefe!' : '¡El jefe ganó esta vez!'}
        description={`Sobreviviste ${score} ${score === 1 ? 'palabra' : 'palabras'}. Las que fallaste volverán en la próxima ronda.${nodeResultNote(session.result?.passed)}`}
        savedOffline={session.result?.savedOffline}
        achievement={session.result?.achievement}
        okText="Salir"
        secondaryText="Revancha"
        onOk={() => navigation.goBack()}
        onReview={restart}
      />
    </GameScaffold>
  );
}

const styles = StyleSheet.create({
  wordCard: {
    marginVertical: 24,
    minHeight: 170,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
