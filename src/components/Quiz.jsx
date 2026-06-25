import React, { useState, useEffect } from 'react';
import { View, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from 'react-native-paper';
import QuizResultModal from './QuizResultModal';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';
import { useAppTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import SoundManager from '../config/sounds';
import { Button, Card, Typography } from 'heroui-native';

export default function Quiz({
  questions = [],
  heading = '',
  onBack = () => {},
  instructionText = 'Selecciona la traducción correcta',
  onFinish = () => {},
  deckId = null,
}) {
  const { theme } = useAppTheme();
  const primaryColor = theme.colors.primaryLight || theme.colors.primary;
  const insets = useSafeAreaInsets();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState([]);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => { setStartTime(Date.now()); }, []);

  useEffect(() => {
    if (currentQuestion?.options) {
      setShuffledOptions([...currentQuestion.options].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions]);

  const handleOptionSelect = (optionId) => {
    if (!isVerified) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedOption(optionId);
    }
  };

  const handleVerify = () => {
    if (selectedOption && currentQuestion) {
      const selected = currentQuestion.options.find((opt) => opt.id === selectedOption);
      const correct = selected.correct;
      setIsCorrect(correct);
      setIsVerified(true);
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        SoundManager.play('correct');
        setScore((prev) => prev + 1);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        SoundManager.play('wrong');
        setFailedQuestions((prev) => [...prev, currentQuestion]);
      }
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsVerified(false);
      setIsCorrect(false);
    } else {
      try {
        const storedUser = await SecureStore.getItemAsync('userInfo');
        const token = await SecureStore.getItemAsync('token');
        if (storedUser && token) {
          const user = JSON.parse(storedUser);
          const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
          if (userId) {
            const res = await fetch(`${config.BASE_URL}/progress/quiz-complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                userId: Number(userId),
                deckId: deckId ? Number(deckId) : null,
                totalQuestions: questions.length,
                correctAnswers: score,
                timeSpentSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.unlockedAchievements?.length > 0) {
                const ach = data.unlockedAchievements[0];
                setTimeout(() => {
                  Alert.alert(
                    '🏆 ¡Nuevo Logro Desbloqueado!',
                    `¡Has completado: ${ach.title}!\n\n${ach.description}`,
                    [{ text: '¡Genial!' }]
                  );
                }, 500);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error al guardar progreso del quiz:', e);
      }
      onFinish(score, questions.length);
      setResultModalVisible(true);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <View className="px-5 pb-4">
          <Button
            variant="ghost"
            className="self-start flex-row items-center gap-2 mb-3 -ml-2"
            onPress={onBack}
          >
            <ArrowLeft size={24} color={primaryColor} />
            <Button.Label className="text-accent font-semibold">{heading}</Button.Label>
          </Button>
          <Typography type="body-sm" color="muted" className="mb-2">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </Typography>
          <ProgressBar
            style={{ height: 8, borderRadius: 4 }}
            progress={questions.length ? (currentQuestionIndex + 1) / questions.length : 0}
            color={primaryColor}
          />
        </View>
      </View>

      {/* Body */}
      <View className="flex-1 px-5" style={{ paddingBottom: insets.bottom + 20 }}>
        {/* Question */}
        <View className="items-center py-8">
          {currentQuestion?.image && (
            <Image
              source={{ uri: currentQuestion.image }}
              style={{ width: 120, height: 120, marginBottom: 16, borderRadius: 16 }}
              resizeMode="contain"
            />
          )}
          <Typography type="h4" weight="bold" align="center" className="mb-2">
            {currentQuestion?.question}
          </Typography>
          <Typography type="body-sm" color="muted" align="center">{instructionText}</Typography>
        </View>

        {/* Options */}
        <View className="gap-3 mb-5">
          {shuffledOptions.map((option) => {
            const isSelected = selectedOption === option.id;
            const showCorrect = isVerified && option.correct;
            const showIncorrect = isVerified && isSelected && !option.correct;

            let variant = 'outline';
            let extraClass = '';
            if (showCorrect) { variant = 'ghost'; extraClass = 'border-2 border-success bg-success/10'; }
            else if (showIncorrect) { variant = 'ghost'; extraClass = 'border-2 border-danger bg-danger/10'; }
            else if (isSelected) { variant = 'primary'; }

            return (
              <Button
                key={option.id}
                variant={variant}
                className={`w-full justify-between px-4 h-14 ${extraClass}`}
                onPress={() => {
                  try {
                    Speech.stop();
                    Speech.speak(option.text, { language: 'en-US', rate: 1.0, pitch: 1.0 });
                  } catch {}
                  handleOptionSelect(option.id);
                }}
                isDisabled={isVerified}
              >
                <Button.Label
                  className={
                    showCorrect ? 'text-success font-semibold' :
                    showIncorrect ? 'text-danger font-semibold' :
                    isSelected ? 'text-white' : 'text-foreground'
                  }
                >
                  {option.text}
                </Button.Label>
                {showCorrect && <CheckCircle2 size={22} color="#10B981" />}
                {showIncorrect && <XCircle size={22} color="#EF4444" />}
              </Button>
            );
          })}
        </View>

        {/* Verify / Next */}
        <Button
          size="lg"
          className={`w-full ${
            isVerified
              ? isCorrect
                ? 'bg-success'
                : 'bg-danger'
              : ''
          }`}
          onPress={isVerified ? handleNext : handleVerify}
          isDisabled={!selectedOption}
        >
          <Button.Label>
            {isVerified
              ? currentQuestionIndex < questions.length - 1
                ? 'Siguiente'
                : 'Ver Resultados'
              : 'Verificar'}
          </Button.Label>
        </Button>
      </View>

      <QuizResultModal
        visible={resultModalVisible}
        score={score}
        total={questions.length}
        onOk={() => { setResultModalVisible(false); onBack(); }}
        onReview={() => {
          setResultModalVisible(false);
          Alert.alert('Repaso', 'En la próxima versión podrás repasar solo tus errores aquí mismo.');
          onBack();
        }}
        hasFailed={failedQuestions.length > 0}
      />
    </View>
  );
}
