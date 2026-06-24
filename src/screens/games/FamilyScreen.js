import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function Family({ route }) {
  const { deckId, deckName } = route?.params || {};
  const questions = [
    {
      id: 1,
      question: 'Padre',
      options: [
        { id: 1, text: 'Father', correct: true },
        { id: 2, text: 'Mother', correct: false },
        { id: 3, text: 'Brother', correct: false },
        { id: 4, text: 'Sister', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Madre',
      options: [
        { id: 1, text: 'Father', correct: false },
        { id: 2, text: 'Mother', correct: true },
        { id: 3, text: 'Uncle', correct: false },
        { id: 4, text: 'Aunt', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Hermano',
      options: [
        { id: 1, text: 'Cousin', correct: false },
        { id: 2, text: 'Brother', correct: true },
        { id: 3, text: 'Sister', correct: false },
        { id: 4, text: 'Son', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Abuelo',
      options: [
        { id: 1, text: 'Grandmother', correct: false },
        { id: 2, text: 'Grandfather', correct: true },
        { id: 3, text: 'Nephew', correct: false },
        { id: 4, text: 'Niece', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Hijo',
      options: [
        { id: 1, text: 'Daughter', correct: false },
        { id: 2, text: 'Son', correct: true },
        { id: 3, text: 'Child', correct: false },
        { id: 4, text: 'Parent', correct: false }
      ]
    }
  ];

  const navigation = useNavigation();

  return (
    <Quiz
      questions={questions}
      heading={deckName || 'Family'}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      onFinish={(score, total) => {
        console.log('Quiz Familia terminado:', score, '/', total);
      }}
    />
  );
}
