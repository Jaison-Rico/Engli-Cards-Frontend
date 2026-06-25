import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Quiz from '../../components/Quiz';
import { getDeckQuiz } from '../../services/decks.service';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function DeckQuizScreen({ route, navigation }) {
  const { theme } = useAppTheme();
  const { deckId, deckName } = route.params;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchQuiz(); }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await getDeckQuiz(deckId);
      setQuizData(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4">
        <Spinner size="lg" />
        <Typography type="body" color="muted" weight="medium">Generando tu Quiz...</Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5 gap-5">
        <Typography type="body" className="text-danger text-center">{error}</Typography>
        <Button size="lg" className="px-8" onPress={() => navigation.goBack()}>
          <Button.Label>Volver</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Quiz
        questions={quizData}
        heading={deckName}
        deckId={deckId}
        onBack={() => navigation.goBack()}
        instructionText="Selecciona la traducción correcta"
        onFinish={(score, total) => console.log(`Quiz finalizado: ${score}/${total}`)}
      />
    </View>
  );
}
