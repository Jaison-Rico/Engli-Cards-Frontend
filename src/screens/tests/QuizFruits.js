import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function QuizFruits() {
const questions = [
  {
    id: 1,
    question: 'Manzana',
    options: [
      { id: 1, text: 'Apple', correct: true },
      { id: 2, text: 'Banana', correct: false },
      { id: 3, text: 'Cherry', correct: false },
      { id: 4, text: 'Orange', correct: false }
    ]
  },
  {
    id: 2,
    question: 'Cambur - Banano',
    options: [
      { id: 1, text: 'Apple', correct: false },
      { id: 2, text: 'Banana', correct: true },
      { id: 3, text: 'Cherry', correct: false },
      { id: 4, text: 'Orange', correct: false }
    ]
  },
  {
    id: 3,
    question: 'Naranja',
    options: [
      { id: 1, text: 'Watermelon', correct: false },
      { id: 2, text: 'Pineapple', correct: false },
      { id: 3, text: 'Orange', correct: true },
      { id: 4, text: 'Elderberry', correct: false }
    ]
  },
  {
    id: 4,
    question: 'Patilla - Zandia',
    options: [
      { id: 1, text: 'Hello', correct: false },
      { id: 2, text: 'Watermelon', correct: true },
      { id: 3, text: 'Peach', correct: false },
      { id: 4, text: 'Mango', correct: false }
    ]
  },
  {
    id: 5,
    question: 'Cereza',
    options: [
      { id: 1, text: 'Grapes', correct: false },
      { id: 2, text: 'Cherry', correct: true },
      { id: 3, text: 'Kiwi', correct: false },
      { id: 4, text: 'Mandarin', correct: false }
    ]
  }
];

const navigation = useNavigation();

return (
  <Quiz
    questions={questions}
    heading={'Saludos'}
    onBack={() => navigation.goBack()}
    onFinish={(score, total) => {
      console.log('Quiz terminado. Puntuación:', score, '/', total);
    }}
  />
);
}
