import { useNavigation } from '@react-navigation/native';
import Quiz from '../../components/Quiz';

export default function School({ route }) {
  const { deckId, deckName } = route?.params || {};
  const questions = [
    {
      id: 1,
      question: 'Escuela',
      options: [
        { id: 1, text: 'School', correct: true },
        { id: 2, text: 'Library', correct: false },
        { id: 3, text: 'Classroom', correct: false },
        { id: 4, text: 'College', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Estudiante',
      options: [
        { id: 1, text: 'Principal', correct: false },
        { id: 2, text: 'Student', correct: true },
        { id: 3, text: 'Member', correct: false },
        { id: 4, text: 'Player', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Lápiz',
      options: [
        { id: 1, text: 'Pen', correct: false },
        { id: 2, text: 'Pencil', correct: true },
        { id: 3, text: 'Eraser', correct: false },
        { id: 4, text: 'Book', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Libro',
      options: [
        { id: 1, text: 'Paper', correct: false },
        { id: 2, text: 'Book', correct: true },
        { id: 3, text: 'Notebook', correct: false },
        { id: 4, text: 'Bag', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Examen',
      options: [
        { id: 1, text: 'Grade', correct: false },
        { id: 2, text: 'Test', correct: true },
        { id: 3, text: 'Homework', correct: false },
        { id: 4, text: 'Lesson', correct: false }
      ]
    }
  ];

  const navigation = useNavigation();

  return (
    <Quiz
      questions={questions}
      heading={deckName || 'School'}
      deckId={deckId}
      onBack={() => navigation.goBack()}
      onFinish={(score, total) => {
        console.log('Quiz Escuela terminado:', score, '/', total);
      }}
    />
  );
}
