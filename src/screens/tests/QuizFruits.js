import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function QuizFruits({ route }) {
  const { deckId, deckName } = route?.params || {};
  const questions = [
    // ... (questions remain the same)
  ];

  const navigation = useNavigation();

  return (
    <Quiz
      questions={questions}
      heading={deckName || 'Fruits'}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      onFinish={(score, total) => {
        console.log('Quiz terminado. Puntuación:', score, '/', total);
      }}
    />
  );
}
