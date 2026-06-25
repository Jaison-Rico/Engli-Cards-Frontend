import React, { useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Typography } from 'heroui-native';
import FlashCard from '../../components/FlashCard';
import QuizStartButton from '../../components/QuizStartButton';
export default function GameFlashCard({ navigation, route }) {
  const { sampleCards, quiz } = route.params;
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [toastAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (sampleCards?.length > 0) {
      let prepared = [...sampleCards];
      if (!quiz) prepared = prepared.sort(() => Math.random() - 0.5);
      setCards(prepared);
    }
  }, [sampleCards, quiz]);

  useEffect(() => {
    if (toast.visible) {
      Animated.sequence([
        Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.delay(2500),
        Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast({ visible: false, message: '', type: '' }));
    }
  }, [toast.visible]);

  const showToast = (message, type) => setToast({ visible: true, message, type });

  const total = cards.length;
  const current = cards[index];
  const isSystemGame = Boolean(quiz);

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < total - 1 ? i + 1 : i));

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -40) goNext();
      else if (event.translationX > 40) goPrev();
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View className="flex-1 bg-background items-center" style={{ paddingTop: insets.top + 10 }}>

        {/* Top Row */}
        <View className="flex-row justify-between items-center w-full px-5 mb-8">
          <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
            <ArrowLeft color="#12B5B0" size={28} />
          </Button>
          <QuizStartButton
            onPress={() => {
              if (quiz) {
                navigation.navigate(quiz, { deckId: route.params.deckId, deckName: route.params.deckName });
              } else if (route.params.deckId) {
                if (total >= 5) {
                  navigation.navigate('DeckQuiz', { deckId: route.params.deckId, deckName: route.params.deckName || 'Quiz' });
                } else {
                  showToast('Necesitas al menos 5 tarjetas en este mazo para hacer un quiz.', 'error');
                }
              } else {
                showToast('No hay prueba disponible para este conjunto de tarjetas.', 'error');
              }
            }}
            label="Comenzar Prueba"
            iconName="play-outline"
          />
        </View>

        {/* Card Area */}
        <View className="flex-1 w-full items-center justify-center pb-10">
          <Typography type="body-sm" color="muted" className="mb-4">
            Tarjeta {index + 1} de {total}
          </Typography>

          {cards.length > 0 ? (
            <>
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

              {/* Dots */}
              <View className="flex-row justify-center mt-5 gap-1.5">
                {cards.map((_, i) => (
                  <View
                    key={i}
                    className={`h-2 rounded-full ${i === index ? 'w-5 bg-accent' : 'w-2 bg-border'}`}
                  />
                ))}
              </View>
            </>
          ) : (
            <View className="items-center px-5 gap-4">
              {quiz ? (
                <>
                  <Ionicons name="book-outline" size={60} color="#12B5B0" />
                  <Typography type="body" align="center" className="text-foreground">
                    Este nivel no tiene tarjetas de estudio aún, pero puedes saltar directamente a la prueba.
                  </Typography>
                </>
              ) : (
                <Spinner size="lg" />
              )}
            </View>
          )}

          {/* Controls */}
          <View className="flex-row justify-center gap-4 mt-6">
            <Button
              variant="primary"
              size="lg"
              className="px-6"
              onPress={goPrev}
              isDisabled={index === 0}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
              <Button.Label>Anterior</Button.Label>
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="px-6"
              onPress={goNext}
              isDisabled={index === total - 1}
            >
              <Button.Label>Siguiente</Button.Label>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </Button>
          </View>
        </View>

        {/* Toast */}
        {toast.visible && (
          <Animated.View
            className="absolute top-0 self-center rounded-2xl px-4 py-3 flex-row items-center gap-3"
            style={{
              backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
              transform: [
                { translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 50] }) },
                { scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
              opacity: toastAnim,
            }}
          >
            {toast.type === 'success'
              ? <CheckCircle size={22} color="white" />
              : <AlertCircle size={22} color="white" />
            }
            <Typography type="body-sm" weight="semibold" className="text-white">{toast.message}</Typography>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}
