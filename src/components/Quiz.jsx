import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import QuizResultModal from './QuizResultModal';
import { MoveLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';

/*
	Componente reutilizable de Quiz.
	Props esperadas:
	- questions: Array de objetos { id, question, options: [{ id, text, correct }] }
		Debe contener exactamente 5 preguntas y cada una 4 opciones (requisito actual de negocio).
	- heading: Texto que aparece junto al botón volver.
	- onBack: función para manejar acción de volver.
	- instructionText: texto secundario debajo de la pregunta.
	- onFinish: callback(score, total) cuando finaliza el quiz antes de cerrar modal.

	Notas:
	- Si en el futuro cambia el número de preguntas u opciones, solo se debe ajustar validación.
	- Se mantiene lógica simple: verificar -> siguiente -> mostrar resultados.
	- Evitar duplicación: otras pantallas solo definen su arreglo de preguntas y usan este componente.
*/

export default function Quiz({
	questions = [],
	heading = '',
	onBack = () => { },
	instructionText = 'Selecciona la traducción correcta',
	onFinish = () => { }
}) {
	// Validaciones básicas según reglas actuales (no bloquea render, pero informa en consola)
	if (questions.length !== 5) {
		console.warn('[Quiz] Se esperaban 5 preguntas; recibidas:', questions.length);
	}
	questions.forEach((q) => {
		if (q.options?.length !== 4) {
			console.warn(`[Quiz] Pregunta ${q.id} no tiene 4 opciones (tiene ${q.options?.length}).`);
		}
	});

	const insets = useSafeAreaInsets();


	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState(null);
	const [isVerified, setIsVerified] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [score, setScore] = useState(0);
	const [resultModalVisible, setResultModalVisible] = useState(false);
	const [startTime, setStartTime] = useState(null);

	useEffect(() => {
		setStartTime(Date.now());
	}, []);

	const currentQuestion = questions[currentQuestionIndex];

	const handleOptionSelect = (optionId) => {
		if (!isVerified) {
			setSelectedOption(optionId);
		}
	};

	const handleVerify = () => {
		if (selectedOption && currentQuestion) {
			const selected = currentQuestion.options.find(opt => opt.id === selectedOption);
			const correct = selected.correct;
			setIsCorrect(correct);
			setIsVerified(true);
			if (correct) {
				setScore((prev) => prev + 1);
			}
		}
	};

	const handleNext = async () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setSelectedOption(null);
			setIsVerified(false);
			setIsCorrect(false);
		} else {
			// Enviar progreso al backend
			try {
				const storedUser = await SecureStore.getItemAsync('userInfo');
				const token = await SecureStore.getItemAsync('token');
				
				if (storedUser && token) {
					const user = JSON.parse(storedUser);
					const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
					
					if (userId) {
						const res = await fetch(`${config.BASE_URL}/progress/quiz-complete`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`
							},
							body: JSON.stringify({
								userId: Number(userId),
								totalQuestions: questions.length,
								correctAnswers: score,
								timeSpentSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
							})
						});

						if (res.ok) {
							const data = await res.json();
							if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
								// Mostrar notificación de logro
								const ach = data.unlockedAchievements[0];
								setTimeout(() => {
									Alert.alert(
										'🏆 ¡Nuevo Logro Desbloqueado!', 
										`¡Has completado: ${ach.title}!\n\n${ach.description}`,
										[{ text: '¡Genial!' }]
									);
								}, 500); // Pequeño retraso para que aparezca después/junto con el modal
							}
						}
					}
				}
			} catch(e) {
				console.error("Error al guardar progreso del quiz:", e);
			}

			onFinish(score, questions.length);
			setResultModalVisible(true);
		}
	};

	return (
		<View>
			{/* Encabezado con fondo blanco extendido */}
			<View style={{ backgroundColor: '#FFFFFF', paddingTop: insets.top }}>
				<View style={{ ...styles.containerMCTop }}>
					<TouchableOpacity style={{...styles.backButton}} onPress={onBack}>
						<MoveLeft size={25} color="#6200ee" />
						<Text style={styles.textButtonBackQG}> {heading}</Text>
					</TouchableOpacity>
					<Text style={styles.textsQG}>Pregunta {currentQuestionIndex + 1} de {questions.length}!</Text>
					<ProgressBar
						style={{ marginTop: 20 }}
						progress={questions.length ? (currentQuestionIndex + 1) / questions.length : 0}
						color={'#6200ee'}
					/>
				</View>
			</View>
			{/* contenedor main */}
			<View style={{paddingBottom: insets.bottom}}>
				{/* Pregunta */}
				<View style={styles.containerTitleQG}>
					<Text style={styles.textTitleQG}>{currentQuestion?.question}</Text>
					<Text style={styles.textsQG2}>{instructionText}</Text>
				</View>

				<View style={{flexDirection: "colum", gap: 20}}>
					{/* Opciones */}

						{currentQuestion?.options?.map((option) => (
							<TouchableOpacity
								key={option.id}
								style={[
									styles.containerOptionsQG,
									selectedOption === option.id && styles.selectedOption,
									isVerified && option.correct && styles.correctOption,
									isVerified && selectedOption === option.id && !option.correct && styles.incorrectOption
								]}
								onPress={() => {
									try {
										Speech.stop();
										Speech.speak(option.text, { language: 'en-US', rate: 1.0, pitch: 1.0 });
									} catch (e) { }
									handleOptionSelect(option.id);
								}}
								disabled={isVerified}
							>
								<Text style={styles.optionButton}>{option.text}</Text>
							</TouchableOpacity>
						))}
					{/* Botón verificar / siguiente */}
						<TouchableOpacity
							style={[
								styles.containerVerifyQG,
								!selectedOption && styles.disabledButton,
								isVerified && (isCorrect ? styles.correctButton : styles.incorrectButton)
							]}
							onPress={isVerified ? handleNext : handleVerify}
							disabled={!selectedOption}
						>
							<Text style={styles.textBottomVerifyQG}>
								{isVerified ?
									(currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultados')
									: 'Verificar'}
							</Text>
						</TouchableOpacity>
				</View>
			</View>

			{/* Modal resultados */}
			<QuizResultModal
				visible={resultModalVisible}
				score={score}
				total={questions.length}
				onOk={() => {
					setResultModalVisible(false);
					onBack();
				}}
			/>
		</View>
	);
}

// Importamos estilos específicos de Quiz Greetings para conservar apariencia.
// Otras pantallas pueden crear sus propios estilos y ajustar este import.
// Si se requiere estilos diferentes, se puede agregar prop styleOverrides.
import styles from '../styles/stylesTestQuiz/StylesQGreetings';
