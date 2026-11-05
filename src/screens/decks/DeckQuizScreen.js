import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { AlertCircle, WifiOff } from 'lucide-react-native';
import { Spinner, Typography } from 'heroui-native';
import Quiz from '../../components/Quiz';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { getDeckQuiz } from '../../services/decks.service';
import { getErrorMessage, isNetworkError } from '../../utils/errors';

export default function DeckQuizScreen({ route, navigation }) {
  const { deckId, deckName } = route.params;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuizData(await getDeckQuiz(deckId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background">
        <Spinner size="lg" />
        <Typography type="body" color="muted" weight="medium">Generando tu quiz…</Typography>
      </View>
    );
  }

  if (error) {
    const offline = isNetworkError(error);
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title={deckName} onBack={() => navigation.goBack()} />
        <View className="flex-1 justify-center">
          <EmptyState
            icon={offline ? WifiOff : AlertCircle}
            tone={offline ? 'default' : 'danger'}
            title={offline ? 'El quiz necesita conexión' : 'No se pudo generar el quiz'}
            description={offline
              ? 'Las preguntas se generan en el servidor. Mientras tanto puedes repasar tus tarjetas.'
              : getErrorMessage(error)}
            actionLabel="Reintentar"
            onAction={fetchQuiz}
          />
        </View>
      </View>
    );
  }

  return (
    <Quiz
      questions={quizData}
      heading={deckName}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      instructionText="Selecciona la traducción correcta"
    />
  );
}
