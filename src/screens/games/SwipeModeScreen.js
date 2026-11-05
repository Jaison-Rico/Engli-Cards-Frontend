import React, { useMemo, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GameScaffold from '../../components/games/GameScaffold';
import SwipeCard, { SwipeFace } from '../../components/games/SwipeCard';
import useGameSession, { poolLoader, nodeResultNote } from '../../components/games/useGameSession';
import QuizResultModal from '../../components/QuizResultModal';
import PressableScale from '../../components/ui/PressableScale';
import { useAppTheme } from '../../context/ThemeContext';
import { shuffle } from '../../services/learning.service';
import SoundManager from '../../config/sounds';
import { elevation } from '../../theme/theme';

const ROUND_SIZE = 15;
const MIN_CARDS = 4;

/**
 * Cada ronda muestra la palabra en inglés y una traducción propuesta: la
 * correcta (50%) o la de otra tarjeta. Derecha = "es correcta",
 * izquierda = "es incorrecta".
 */
const buildPrompts = (cards) =>
  cards.map((card) => {
    const isMatch = Math.random() < 0.5;
    const others = cards.filter((c) => c.key !== card.key);
    const decoy = others[Math.floor(Math.random() * others.length)];
    return { card, shown: isMatch || !decoy ? card.back : decoy.back, isMatch: isMatch || !decoy };
  });

/** Tarjeta de atrás: crece mientras se arrastra la de arriba. */
function BackCard({ depth, drag, width, height, prompt }) {
  const style = useAnimatedStyle(() => {
    const d = depth - drag.value; // 1 → 0 cuando la de arriba sale
    return {
      transform: [{ translateY: interpolate(d, [0, 1, 2], [0, 14, 28]) }, { scale: interpolate(d, [0, 1, 2], [1, 0.94, 0.88]) }],
      opacity: interpolate(d, [0, 1, 2], [1, 0.9, 0.6]),
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width, height, borderRadius: 28 }, elevation(1), style]}>
      <SwipeFace width={width} height={height} front={prompt.card.front} shown={prompt.shown} image={prompt.card.image} />
    </Animated.View>
  );
}

export default function SwipeModeScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { theme } = useAppTheme();
  const { width: screenW } = useWindowDimensions();
  const session = useGameSession(poolLoader(params?.source, ROUND_SIZE, shuffle), { node: params?.node });
  const prompts = useMemo(() => buildPrompts(session.cards), [session.cards]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { ok, text, id }
  const drag = useSharedValue(0);
  const topRef = useRef(null);

  const width = Math.min(screenW - 48, 360);
  const height = Math.round(width * 1.2);
  const total = prompts.length;
  const done = index >= total;

  const handleSwiped = (direction) => {
    const prompt = prompts[index];
    if (!prompt) return;
    const saidMatch = direction === 'right';
    const correct = saidMatch === prompt.isMatch;
    session.answer(prompt.card, correct);
    Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    SoundManager.play(correct ? 'correct' : 'wrong');
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setFeedback({ ok: correct, text: correct ? '¡Correcto!' : `${prompt.card.front} = ${prompt.card.back}`, id: index });
    drag.value = 0;
    setIndex(index + 1);
    if (index + 1 >= total) session.finish(nextScore, total);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setFeedback(null);
    drag.value = 0;
    session.reload();
  };

  const progress = total > 0 ? index / total : 0;

  return (
    <GameScaffold
      title="Modo Swipe"
      subtitle={params?.sourceLabel ?? 'Todo mezclado'}
      onBack={() => navigation.goBack()}
      loading={session.loading}
      error={session.error}
      onRetry={session.reload}
      empty={!session.loading && total < MIN_CARDS}
      emptyText={`Necesitas al menos ${MIN_CARDS} tarjetas. Elige otra lección o mazo.`}
      right={(
        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: `${theme.colors.primary}1A` }}>
          <Typography type="body-sm" weight="bold" style={{ color: theme.colors.primary }}>{score} pts</Typography>
        </View>
      )}
    >
      {/* Progreso */}
      <View className="mx-5 mt-1 h-2 overflow-hidden rounded-full bg-default">
        <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: '#4A5BD4' }} />
      </View>
      <Typography type="body-xs" color="muted" align="center" className="mt-2">
        Desliza → si la traducción es correcta, ← si no
      </Typography>

      {/* Mazo */}
      <View className="flex-1 items-center justify-center">
        <View style={{ width, height }}>
          {[2, 1].map((depth) => {
            const p = prompts[index + depth];
            return p ? <BackCard key={index + depth} depth={depth} drag={drag} width={width} height={height} prompt={p} /> : null;
          })}
          {!done && prompts[index] ? (
            <SwipeCard
              key={index}
              ref={topRef}
              width={width}
              height={height}
              front={prompts[index].card.front}
              shown={prompts[index].shown}
              image={prompts[index].card.image}
              drag={drag}
              onSwiped={handleSwiped}
            />
          ) : null}
        </View>

        {/* Feedback de la última respuesta */}
        <View className="h-12 justify-center">
          {feedback ? (
            <Animated.View key={feedback.id} entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
              <View className="flex-row items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: feedback.ok ? '#10B98122' : '#F43F5E22' }}>
                {feedback.ok ? <Check color="#10B981" size={16} /> : <X color="#F43F5E" size={16} />}
                <Typography type="body-sm" weight="semibold" numberOfLines={1} style={{ color: feedback.ok ? '#0E8F65' : '#C81E45', maxWidth: 260 }}>
                  {feedback.text}
                </Typography>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {/* Botones (alternativa accesible al gesto) */}
      <View className="flex-row items-center justify-center gap-10 pb-2">
        <PressableScale
          onPress={() => topRef.current?.swipe('left')}
          disabled={done}
          haptic="light"
          accessibilityLabel="Traducción incorrecta"
          className="h-16 w-16 items-center justify-center rounded-full border border-border bg-surface"
          style={elevation(2, theme.mode)}
        >
          <X color="#F43F5E" size={28} strokeWidth={3} />
        </PressableScale>
        <PressableScale
          onPress={() => topRef.current?.swipe('right')}
          disabled={done}
          haptic="light"
          accessibilityLabel="Traducción correcta"
          className="h-16 w-16 items-center justify-center rounded-full border border-border bg-surface"
          style={elevation(2, theme.mode)}
        >
          <Check color="#10B981" size={28} strokeWidth={3} />
        </PressableScale>
      </View>

      <QuizResultModal
        visible={Boolean(session.result)}
        score={session.result?.correct ?? 0}
        total={session.result?.total ?? 0}
        title="¡Ronda terminada!"
        description={session.result ? `Acertaste ${session.result.correct} de ${session.result.total}.${nodeResultNote(session.result.passed)}` : undefined}
        savedOffline={session.result?.savedOffline}
        achievement={session.result?.achievement}
        okText="Salir"
        secondaryText="Jugar otra vez"
        onOk={() => navigation.goBack()}
        onReview={restart}
      />
    </GameScaffold>
  );
}
