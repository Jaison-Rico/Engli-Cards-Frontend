import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import styles from '../../styles/styleGameFlashCard';
import { X, CheckCircle, AlertCircle } from 'lucide-react-native';
import FlashCard from '../../components/FlashCard';
import { Ionicons } from '@expo/vector-icons';
import QuizStartButton from '../../components/QuizStartButton';
import stylesMS from '../../styles/stylesMS';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Pantalla exportada por defecto (usada por el Navigator)
export default function GameFlashCard({ navigation, route }) {
  const { sampleCards, quiz } = route.params
  const [index, setIndex] = useState(0);
  const total = sampleCards.length;
  const current = sampleCards[index];
  const insets = useSafeAreaInsets(); 
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [toastAnim] = useState(new Animated.Value(0));

  // Animación del toast
  useEffect(() => {
    if (toast.visible) {
      Animated.sequence([
        Animated.spring(toastAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.delay(2500),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setToast({ visible: false, message: '', type: '' });
      });
    }
  }, [toast.visible]);

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };






  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < total - 1 ? i + 1 : i));

  return (
    <View style={{...styles.screen, paddingTop: insets.top + 20}}>
      <View>
        <QuizStartButton
          onPress={() => {
            if (quiz) {
              navigation.navigate(quiz)
            } else {
              showToast('No hay prueba disponible para este conjunto de tarjetas.', 'error');
            }
          }}
          buttonStyle={styles.quizBtn}
          textStyle={styles.btnText}
          label="Comenzar Prueba"
          iconName="play-outline"
        />
      </View>
      <Text style={styles.counter}>Tarjeta {index + 1} de {total}</Text>
      <FlashCard key={index} item={current} styles={styles} frontLabel="English" backLabel="Español" />

      <View style={styles.dotsRow}>
        {sampleCards.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={[styles.btn, index === 0 && styles.btnDisabled]}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.btnText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} disabled={index === total - 1} style={[styles.btn, index === total - 1 && styles.btnDisabled]}>
          <Text style={styles.btnText}>Siguiente</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      
				{/* Toast personalizado */}
				{toast.visible && (
					<Animated.View
						style={[
							stylesMS.toastContainer,
							{
								backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
								transform: [
									{
										translateY: toastAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [-100, 50]
										})
									},
									{
										scale: toastAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [0.8, 1]
										})
									}
								],
								opacity: toastAnim
							}
						]}
					>
						<View style={stylesMS.toastContent}>
							{toast.type === 'success' ? (
								<CheckCircle size={24} color="white" />
							) : (
								<AlertCircle size={24} color="white" />
							)}
							<Text style={stylesMS.toastText}>{toast.message}</Text>
						</View>
					</Animated.View>
				)}
    </View>
  );
}
