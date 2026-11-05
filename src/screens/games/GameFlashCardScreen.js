import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { ArrowLeft, ChevronLeft, ChevronRight, Play, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Typography } from 'heroui-native';
import FlashCard from '../../components/FlashCard';
import IconButton from '../../components/ui/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import { useAuth, getUserId } from '../../context/AuthContext';
import { completeNode } from '../../services/curriculum.service';
import { markPlayedToday, shuffle } from '../../services/learning.service';
import SoundManager from '../../config/sounds';

const MIN_CARDS_FOR_QUIZ = 5;
const MAX_DOTS = 12;

export default function GameFlashCard({ navigation, route }) {
  const { sampleCards, quiz, deckId, deckName, node } = route.params;
  const { user } = useAuth();
  const userId = getUserId(user);
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { toast } = useFeedback();

  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (sampleCards?.length > 0) {
      // Lecciones y nodos del mapa conservan su orden pedagógico; los mazos se barajan.
      const prepared = quiz || node ? [...sampleCards] : shuffle(sampleCards);
      setCards(prepared);
    }
  }, [sampleCards, quiz, node]);

  const total = cards.length;
  const current = cards[index];
  const isSystemGame = Boolean(quiz || node);
  const isLast = total > 0 && index === total - 1;

  /** Nodo del mapa: completar = haber recorrido todas las tarjetas. */
  const completeLesson = async () => {
    await completeNode(userId, node.id, 'flashcards', 1);
    await markPlayedToday(userId);
    SoundManager.play('success');
    toast.success('¡Nodo completado!', { message: 'Se desbloqueó el siguiente paso del mapa.' });
    navigation.goBack();
  };

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < total - 1 ? i + 1 : i));

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -40) goNext();
      else if (event.translationX > 40) goPrev();
    });

  const startQuiz = () => {
    if (quiz) {
      navigation.navigate(quiz, { deckId, deckName });
    } else if (deckId) {
      if (total >= MIN_CARDS_FOR_QUIZ) navigation.navigate('DeckQuiz', { deckId, deckName: deckName || 'Quiz' });
      else toast.info(`Necesitas al menos ${MIN_CARDS_FOR_QUIZ} tarjetas`, { message: 'Agrega más tarjetas a este mazo para hacer un quiz.' });
    } else {
      toast.info('No hay prueba disponible para este conjunto de tarjetas.');
    }
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 4, paddingBottom: insets.bottom + 16 }}>
        {/* Cabecera */}
        <View className="h-14 flex-row items-center justify-between px-3">
          <IconButton accessibilityLabel="Volver" onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.foreground} size={22} />
          </IconButton>
          <Typography type="body" weight="bold" numberOfLines={1} className="mx-2 flex-1 text-center">
            {deckName || 'Estudiar'}
          </Typography>
          {node ? <View className="w-10" /> : (
            <Button size="sm" onPress={startQuiz}>
              <Play size={14} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} />
              <Button.Label>Prueba</Button.Label>
            </Button>
          )}
        </View>

        {/* Tarjeta */}
        <View className="flex-1 items-center justify-center">
          {total > 0 ? (
            <>
              <Typography type="body-sm" weight="semibold" color="muted" className="mb-2">
                Tarjeta {index + 1} de {total}
              </Typography>
              <FlashCard
                key={index}
                item={current}
                frontLabel={isSystemGame ? 'English' : 'Español'}
                backLabel={isSystemGame ? 'Español' : 'English'}
                frontKey={isSystemGame ? 'english' : 'translation'}
                backKey={isSystemGame ? 'spanish' : 'word'}
                langFront={isSystemGame ? 'en-US' : 'es-ES'}
                langBack={isSystemGame ? 'es-ES' : 'en-US'}
              />
              {total <= MAX_DOTS ? (
                <View className="mt-5 flex-row justify-center gap-1.5">
                  {cards.map((_, i) => (
                    <View key={i} className={`h-2 rounded-full ${i === index ? 'w-5 bg-accent' : 'w-2 bg-border'}`} />
                  ))}
                </View>
              ) : null}
            </>
          ) : quiz ? (
            <View className="items-center gap-4 px-8">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <BookOpen size={28} color={theme.colors.primary} />
              </View>
              <Typography type="body" align="center" className="leading-6">
                Este nivel aún no tiene tarjetas de estudio, pero puedes ir directo a la prueba.
              </Typography>
              <Button onPress={startQuiz}><Button.Label>Comenzar prueba</Button.Label></Button>
            </View>
          ) : (
            <Spinner size="lg" />
          )}
        </View>

        {/* Controles */}
        {total > 0 ? (
          <View className="flex-row justify-center gap-3 px-5">
            <Button variant="secondary" size="lg" className="flex-1" onPress={goPrev} isDisabled={index === 0}>
              <ChevronLeft size={18} color={theme.colors.foreground} />
              <Button.Label className="text-foreground">Anterior</Button.Label>
            </Button>
            {node && isLast ? (
              <Button size="lg" className="flex-1" onPress={completeLesson}>
                <Button.Label>Completar</Button.Label>
                <CheckCircle2 size={18} color={theme.colors.onPrimary} />
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onPress={goNext} isDisabled={isLast}>
                <Button.Label>Siguiente</Button.Label>
                <ChevronRight size={18} color={theme.colors.onPrimary} />
              </Button>
            )}
          </View>
        ) : null}
      </View>
    </GestureDetector>
  );
}
