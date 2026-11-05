import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Button, Typography } from 'heroui-native';
import QuizResultModal from './QuizResultModal';
import CachedImage from './CachedImage';
import PressableScale from './ui/PressableScale';
import IconButton from './ui/IconButton';
import { submitQuizProgress } from '../services/progress.service';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth, getUserId } from '../context/AuthContext';
import { useFeedback } from './feedback/FeedbackProvider';
import SoundManager from '../config/sounds';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

function ProgressTrack({ progress }) {
  const value = useSharedValue(progress);
  useEffect(() => { value.value = withTiming(progress, { duration: 350 }); }, [progress, value]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, value.value)) * 100}%` }));
  return (
    <View className="h-2 overflow-hidden rounded-full bg-default">
      <Animated.View className="h-full rounded-full bg-accent" style={style} />
    </View>
  );
}

function OptionRow({ option, state, disabled, onPress }) {
  const { theme } = useAppTheme();
  const styles = {
    idle: { container: 'border-border bg-surface', text: 'text-foreground' },
    selected: { container: 'border-accent bg-accent/10', text: 'text-accent' },
    correct: { container: 'border-success bg-success/10', text: 'text-success' },
    incorrect: { container: 'border-danger bg-danger/10', text: 'text-danger' },
    dimmed: { container: 'border-border bg-surface opacity-50', text: 'text-foreground' },
  }[state];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="light"
      scaleTo={0.98}
      accessibilityState={{ selected: state === 'selected', disabled }}
      className={`min-h-14 flex-row items-center justify-between rounded-2xl border-[1.5px] px-4 py-3.5 ${styles.container}`}
    >
      <Typography type="body" weight="semibold" className={`flex-1 ${styles.text}`}>{option.text}</Typography>
      {state === 'correct' ? <CheckCircle2 size={22} color={theme.colors.success} /> : null}
      {state === 'incorrect' ? <XCircle size={22} color={theme.colors.danger} /> : null}
    </PressableScale>
  );
}

export default function Quiz({
  questions = [],
  heading = '',
  onBack = () => {},
  instructionText = 'Selecciona la traducción correcta',
  onFinish = () => {},
  deckId = null,
}) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = getUserId(user);
  const { toast } = useFeedback();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const [savedOffline, setSavedOffline] = useState(false);
  const startTime = useRef(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const shuffledOptions = useMemo(
    () => (currentQuestion?.options ? shuffle(currentQuestion.options) : []),
    [currentQuestion],
  );

  const handleOptionSelect = (option) => {
    if (isVerified) return;
    try {
      Speech.stop();
      Speech.speak(option.text, { language: 'en-US', rate: 1.0, pitch: 1.0 });
    } catch { /* la voz es opcional */ }
    setSelectedOption(option.id);
  };

  const handleVerify = () => {
    if (!selectedOption || !currentQuestion) return;
    const selected = currentQuestion.options.find((opt) => opt.id === selectedOption);
    const correct = Boolean(selected?.correct);
    setIsCorrect(correct);
    setIsVerified(true);
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      SoundManager.play('correct');
      setScore((prev) => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      SoundManager.play('wrong');
      setFailedCount((prev) => prev + 1);
    }
  };

  const finishQuiz = async () => {
    setFinishing(true);
    let unlocked = null;
    try {
      if (userId) {
        const result = await submitQuizProgress(userId, {
          deckId,
          totalQuestions: questions.length,
          correctAnswers: score,
          timeSpentSeconds: Math.floor((Date.now() - startTime.current) / 1000),
        });
        setSavedOffline(Boolean(result.offline));
        unlocked = result.ok ? result.data?.unlockedAchievements?.[0] : null;
      }
    } catch (e) {
      // Fallo inesperado al guardar el progreso; no debe romper el quiz.
      console.warn('No se pudo registrar el progreso del quiz:', e?.message ?? e);
    } finally {
      setFinishing(false);
    }
    onFinish(score, questions.length);
    // El logro se muestra dentro del modal de resultados (iOS no permite dos
    // modales superpuestos).
    setAchievement(unlocked);
    if (unlocked) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setResultModalVisible(true);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((index) => index + 1);
      setSelectedOption(null);
      setIsVerified(false);
      setIsCorrect(false);
    } else {
      finishQuiz();
    }
  };

  const optionState = (option) => {
    const isSelected = selectedOption === option.id;
    if (!isVerified) return isSelected ? 'selected' : 'idle';
    if (option.correct) return 'correct';
    if (isSelected) return 'incorrect';
    return 'dimmed';
  };

  const actionLabel = isVerified ? (isLastQuestion ? 'Ver resultados' : 'Siguiente') : 'Verificar';
  const actionClass = isVerified ? (isCorrect ? 'bg-success' : 'bg-danger') : '';

  return (
    <View className="flex-1 bg-background">
      {/* Cabecera */}
      <View className="border-b border-border bg-surface px-4 pb-4" style={{ paddingTop: insets.top + 4 }}>
        <View className="mb-2 h-14 flex-row items-center gap-1">
          <IconButton accessibilityLabel="Salir del quiz" onPress={onBack}>
            <ArrowLeft size={22} color={theme.colors.foreground} />
          </IconButton>
          <Typography type="body" weight="bold" numberOfLines={1} className="flex-1">{heading}</Typography>
          <Typography type="body-sm" weight="semibold" color="muted">
            {Math.min(currentQuestionIndex + 1, questions.length)}/{questions.length}
          </Typography>
        </View>
        <View className="px-1">
          <ProgressTrack progress={questions.length ? (currentQuestionIndex + (isVerified ? 1 : 0)) / questions.length : 0} />
        </View>
      </View>

      {/* Pregunta */}
      <View className="flex-1 px-5" style={{ paddingBottom: insets.bottom + 20 }}>
        <Animated.View key={currentQuestionIndex} entering={FadeIn.duration(220)} className="items-center py-8">
          {currentQuestion?.image ? (
            <CachedImage
              uri={currentQuestion.image}
              style={{ width: 120, height: 120, marginBottom: 16, borderRadius: 20 }}
              contentFit="contain"
            />
          ) : null}
          <Typography type="body-xs" weight="bold" className="mb-2 uppercase tracking-widest text-accent">
            Pregunta {currentQuestionIndex + 1}
          </Typography>
          <Typography type="h3" weight="bold" align="center" className="mb-2">{currentQuestion?.question}</Typography>
          <Typography type="body-sm" color="muted" align="center">{instructionText}</Typography>
        </Animated.View>

        <View className="mb-5 gap-2.5">
          {shuffledOptions.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              state={optionState(option)}
              disabled={isVerified}
              onPress={() => handleOptionSelect(option)}
            />
          ))}
        </View>

        <View className="flex-1" />

        {isVerified ? (
          <Animated.View entering={FadeIn.duration(180)} className="mb-3 flex-row items-center justify-center gap-2">
            {isCorrect
              ? <CheckCircle2 size={18} color={theme.colors.success} />
              : <XCircle size={18} color={theme.colors.danger} />}
            <Typography type="body-sm" weight="semibold" className={isCorrect ? 'text-success' : 'text-danger'}>
              {isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'}
            </Typography>
          </Animated.View>
        ) : null}

        <Button
          size="lg"
          className={`w-full ${actionClass}`}
          onPress={isVerified ? handleNext : handleVerify}
          isDisabled={!selectedOption || finishing}
        >
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      </View>

      <QuizResultModal
        visible={resultModalVisible}
        score={score}
        total={questions.length}
        hasFailed={failedCount > 0}
        achievement={achievement}
        savedOffline={savedOffline}
        onOk={() => { setResultModalVisible(false); onBack(); }}
        onReview={() => {
          setResultModalVisible(false);
          toast.info('Repaso de errores', { message: 'Pronto podrás repasar solo tus errores aquí mismo.' });
          onBack();
        }}
      />
    </View>
  );
}
