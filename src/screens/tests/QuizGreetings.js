import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function QuizGreetings() {
const questions = [
  {
    id: 1,
    question: 'Hola',
    options: [
      { id: 1, text: 'Hello', correct: true },
      { id: 2, text: 'Bye', correct: false },
      { id: 3, text: 'Good Morning', correct: false },
      { id: 4, text: 'See you soon', correct: false }
    ]
  },
  {
    id: 2,
    question: 'Adiós',
    options: [
      { id: 1, text: 'Hello', correct: false },
      { id: 2, text: 'Goodbye', correct: true },
      { id: 3, text: 'Thanks', correct: false },
      { id: 4, text: 'Please', correct: false }
    ]
  },
  {
    id: 3,
    question: 'Buenos días',
    options: [
      { id: 1, text: 'Hello', correct: false },
      { id: 2, text: 'Please', correct: false },
      { id: 3, text: 'Good Morning', correct: true },
      { id: 4, text: 'Excuse me', correct: false }
    ]
  },
  {
    id: 4,
    question: 'Buenas tardes',
    options: [
      { id: 1, text: 'Hello', correct: false },
      { id: 2, text: 'Good Afternoon', correct: true },
      { id: 3, text: 'Thank you', correct: false },
      { id: 4, text: 'Excuse me', correct: false }
    ]
  },
  {
    id: 5,
    question: 'Buenas noches',
    options: [
      { id: 1, text: 'Hello', correct: false },
      { id: 2, text: 'Good Night', correct: true },
      { id: 3, text: 'Thank you', correct: false },
      { id: 4, text: 'Excuse me', correct: false }
    ]
  }
];

const navigation = useNavigation();

return (
  <Quiz
    questions={questions}
    heading={'Frutas'}
    onBack={() => navigation.goBack()}
    onFinish={(score, total) => {
      console.log('Quiz terminado. Puntuación:', score, '/', total);
    }}
  />
);
}

// Esta pantalla ahora solo define las preguntas específicas y usa el componente reutilizable.