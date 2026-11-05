import React from 'react';
import Quiz from '../../components/Quiz';
import { CATEGORY_QUIZZES } from '../../data/quizzes';

/**
 * Quiz de una lección del sistema. Sustituye a las seis pantallas idénticas
 * (Greetings, Fruits, Family, Work, School, Travel): se registra en el
 * navegador con esos mismos nombres y elige las preguntas según `route.name`.
 */
export default function CategoryQuizScreen({ route, navigation }) {
  const { deckId, deckName } = route?.params || {};
  const quiz = CATEGORY_QUIZZES[route.name] ?? { heading: route.name, questions: [] };

  return (
    <Quiz
      questions={quiz.questions}
      heading={deckName || quiz.heading}
      deckId={deckId}
      onBack={() => navigation.goBack()}
    />
  );
}
