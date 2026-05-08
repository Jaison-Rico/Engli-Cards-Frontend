import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function QuizWork({ route }) {
  const { deckId, deckName } = route?.params || {};
  const questions = [
    {
      id: 1,
      question: 'Trabajo',
      options: [
        { id: 1, text: 'Job', correct: true },
        { id: 2, text: 'School', correct: false },
        { id: 3, text: 'Park', correct: false },
        { id: 4, text: 'Home', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Médico',
      options: [
        { id: 1, text: 'Teacher', correct: false },
        { id: 2, text: 'Doctor', correct: true },
        { id: 3, text: 'Engineer', correct: false },
        { id: 4, text: 'Nurse', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Profesor',
      options: [
        { id: 1, text: 'Student', correct: false },
        { id: 2, text: 'Teacher', correct: true },
        { id: 3, text: 'Boss', correct: false },
        { id: 4, text: 'Clerk', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Oficina',
      options: [
        { id: 1, text: 'Factory', correct: false },
        { id: 2, text: 'Office', correct: true },
        { id: 3, text: 'Store', correct: false },
        { id: 4, text: 'Hospital', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Dinero',
      options: [
        { id: 1, text: 'Credit', correct: false },
        { id: 2, text: 'Money', correct: true },
        { id: 3, text: 'Price', correct: false },
        { id: 4, text: 'Check', correct: false }
      ]
    }
  ];

  const navigation = useNavigation();

  return (
    <Quiz
      questions={questions}
      heading={deckName || 'Trabajo'}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      onFinish={(score, total) => {
        console.log('Quiz Trabajo terminado:', score, '/', total);
      }}
    />
  );
}
