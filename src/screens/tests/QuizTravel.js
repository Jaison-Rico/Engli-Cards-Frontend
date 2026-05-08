import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function QuizTravel({ route }) {
  const { deckId, deckName } = route?.params || {};
  const questions = [
    {
      id: 1,
      question: 'Viaje',
      options: [
        { id: 1, text: 'Trip', correct: true },
        { id: 2, text: 'Road', correct: false },
        { id: 3, text: 'Flight', correct: false },
        { id: 4, text: 'Bus', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Avión',
      options: [
        { id: 1, text: 'Boat', correct: false },
        { id: 2, text: 'Airplane', correct: true },
        { id: 3, text: 'Train', correct: false },
        { id: 4, text: 'Car', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Hotel',
      options: [
        { id: 1, text: 'House', correct: false },
        { id: 2, text: 'Hotel', correct: true },
        { id: 3, text: 'Beach', correct: false },
        { id: 4, text: 'Mountain', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Pasaporte',
      options: [
        { id: 1, text: 'Ticket', correct: false },
        { id: 2, text: 'Passport', correct: true },
        { id: 3, text: 'Id card', correct: false },
        { id: 4, text: 'Visa', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Maleta',
      options: [
        { id: 1, text: 'Bag', correct: false },
        { id: 2, text: 'Suitcase', correct: true },
        { id: 3, text: 'Backpack', correct: false },
        { id: 4, text: 'Wallet', correct: false }
      ]
    }
  ];

  const navigation = useNavigation();

  return (
    <Quiz
      questions={questions}
      heading={deckName || 'Viajes'}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      onFinish={(score, total) => {
        console.log('Quiz Viajes terminado:', score, '/', total);
      }}
    />
  );
}
