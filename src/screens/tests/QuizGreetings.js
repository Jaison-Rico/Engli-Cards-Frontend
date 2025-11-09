import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/stylesTestQuiz/StylesQGreetings';
import { ProgressBar } from 'react-native-paper';
import { MoveLeft } from 'lucide-react-native';
import { useState } from 'react';
import { id } from 'paths-js/ops';

export default function QuizGreetings() {
  const questions = [
    {
      id: 1,
      question: "Hola",
      options: [
        { id: 1, text: "Hello", correct: true },
        { id: 2, text: "Bye", correct: false },
        { id: 3, text: "Good Morning", correct: false },
        { id: 4, text: "See you soon", correct: false }
      ]
    },
    {
      id: 2,
      question: "Adiós",
      options: [
        { id: 1, text: "Hello", correct: false },
        { id: 2, text: "Goodbye", correct: true },
        { id: 3, text: "Thanks", correct: false },
        { id: 4, text: "Please", correct: false }
      ]
    },
    {
      id: 3,
      question: "Buenos días",
      options: [
        { id: 1, text: "Hello", correct: false },
        { id: 2, text: "Please", correct: false },
        { id: 3, text: "Good Morning", correct: true },
        { id: 4, text: "Excuse me", correct: false }
      ]
    },
    {
      id: 4,
      question: "Buenas tardes",
      options: [
        { id: 1, text: "Hello", correct: false },
        { id: 2, text: "Good Afternoon", correct: true },
        { id: 3, text: "Thank you", correct: false },
        { id: 4, text: "Excuse me", correct: false }
      ]
    },
    {
      id: 5,
      question: "Buenas noches",
      options: [
        { id: 1, text: "Hello", correct: false },
        { id: 2, text: "Good Night", correct: true },
        { id: 3, text: "Thank you", correct: false },
        { id: 4, text: "Excuse me", correct: false }
      ]
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId) => {
    if (!isVerified) {
      setSelectedOption(optionId);
    }
  };

  const handleVerify = () => {
    if (selectedOption) {
      const selected = currentQuestion.options.find(opt => opt.id === selectedOption);
      const correct = selected.correct;
      setIsCorrect(correct);
      setIsVerified(true);
      
      if (correct) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsVerified(false);
      setIsCorrect(false);
    } else {
      console.log("Quiz terminado. Puntuación:", score, "/", questions.length);
      // Aquí puedes navegar a resultados
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.containerMCTop}>
        <TouchableOpacity style={styles.backButton}>
          <MoveLeft size={25} color="#6200ee" />
          <Text style={styles.textButtonBackQG}> Saludos</Text>
        </TouchableOpacity>
        <Text style={styles.textsQG}>Pregunta {currentQuestionIndex + 1} de {questions.length}!</Text>
        <ProgressBar 
          style={{ marginTop: 20 }} 
          progress={(currentQuestionIndex + 1) / questions.length} 
          color={"#6200ee"} 
        />
      </View>

      <View style={styles.containerTitleQG}>
        <Text style={styles.textTitleQG}>{currentQuestion.question}</Text>
        <Text style={styles.textsQG2}>Selecciona la traducción correcta</Text>
      </View>

      <View>
        {currentQuestion.options.map((option) => (
          <TouchableOpacity 
            key={option.id}
            style={[
              styles.containerOptionsQG,
              selectedOption === option.id && styles.selectedOption,
              isVerified && option.correct && styles.correctOption,
              isVerified && selectedOption === option.id && !option.correct && styles.incorrectOption
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isVerified}
          >
            <Text style={styles.textsQG}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View>
        <TouchableOpacity 
          style={[
            styles.containerVerifyQG,
            !selectedOption && styles.disabledButton,
            isVerified && (isCorrect ? styles.correctButton : styles.incorrectButton)
          ]}
          onPress={isVerified ? handleNext : handleVerify}
          disabled={!selectedOption}
        >
          <Text style={styles.textsQG}>
            {isVerified ? 
              (currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultados') 
              : 'Verificar'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}