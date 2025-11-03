import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import styles from '../../styles/stylesFrutas';
import fruitsData from './images.json';

// Componente de carta giratoria (interno a esta pantalla)
function FlipCard({ card, containerStyle }) {
	if (!card) return null; // Evita errores si no se pasa la carta

	const flip = useSharedValue(0);
	const [isFlipped, setIsFlipped] = useState(false);
	// Usar exclusivamente la imagen definida en el JSON por cada fruta

	const frontAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
		return { transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }] };
	});

	const backAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
		return { transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }] };
	});

	const handleFlip = () => {
		flip.value = withSpring(isFlipped ? 0 : 1, { damping: 12, stiffness: 140 });
		setIsFlipped(!isFlipped);
	};

	const handleSpeak = () => {
		const text = isFlipped ? card.spanish : card.english;
		const language = isFlipped ? 'es-ES' : 'en-US';
		try {
			Speech.stop();
			Speech.speak(text, { language, pitch: 1.0, rate: 1.0 });
		} catch (e) {
			// noop: evita romper UI si no hay motor TTS
		}
	};

	return (
		<View style={styles.centerAligned}>
			<TouchableOpacity onPress={handleFlip} activeOpacity={0.9} style={[styles.cardContainer, containerStyle]}>
				<Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
					<View style={styles.badge}><Text style={styles.badgeText}>English</Text></View>
					<Text style={styles.cardText}>{card.english}</Text>
					{card.image ? (
						<Image source={{ uri: card.image }} style={styles.cardImage} />
					) : null}
					<Text style={styles.cardHint}>Toca la tarjeta para ver la traducción</Text>
				</Animated.View>
				<Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
					<View style={styles.badge}><Text style={styles.badgeText}>Español</Text></View>
					<Text style={styles.cardText}>{card.spanish}</Text>
					{card.image ? (
						<Image source={{ uri: card.image }} style={styles.cardImage} />
					) : null}
					<Text style={styles.cardHint}>Toca la tarjeta para volver</Text>
				</Animated.View>
			</TouchableOpacity>

			<TouchableOpacity onPress={handleSpeak} style={styles.audioBtn}>
				<Ionicons name="volume-high" size={18} color="#fff" />
				<Text style={styles.audioText}>Escuchar</Text>
			</TouchableOpacity>
		</View>
	);
}

// Datos extraídos desde JSON para separación de contenido
const sampleCards = fruitsData;

// Pantalla exportada por defecto (usada por el Navigator)
export default function Frutas() {
  const [index, setIndex] = useState(0);
  const total = sampleCards.length;
  const current = sampleCards[index];

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < total - 1 ? i + 1 : i));

  return (
    <View style={styles.screen}>
      <Text style={styles.counter}>Tarjeta {index + 1} de {total}</Text>
      <FlipCard key={index} card={current} />

      <View style={styles.dotsRow}>
        {sampleCards.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={[styles.btn, index===0 && styles.btnDisabled]}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.btnText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} disabled={index === total - 1} style={[styles.btn, index===total-1 && styles.btnDisabled]}>
          <Text style={styles.btnText}>Siguiente</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

 