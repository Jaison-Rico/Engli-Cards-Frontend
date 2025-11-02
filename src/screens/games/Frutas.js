import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

// Componente de carta giratoria (interno a esta pantalla)
function FlipCard({ card, containerStyle }) {
  if (!card) return null; // Evita errores si no se pasa la carta

  const flip = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    return { transform: [{ rotateY: `${rotateY}deg` }] };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
    return { transform: [{ rotateY: `${rotateY}deg` }] };
  });

  const handleFlip = () => {
    flip.value = withSpring(isFlipped ? 0 : 1, { damping: 10, stiffness: 100 });
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
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity onPress={handleFlip} style={[styles.cardContainer, containerStyle]}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Text style={styles.cardSubtitle}>English</Text>
          <Text style={styles.cardText}>{card.english}</Text>
          <Text style={styles.cardHint}>Toca para ver traducción</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.cardSubtitle}>Español</Text>
          <Text style={styles.cardText}>{card.spanish}</Text>
          <Text style={styles.cardHint}>Toca para volver</Text>
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSpeak} style={styles.audioBtn}>
        <Ionicons name="volume-high" size={20} color="#fff" />
        <Text style={styles.audioText}>Escuchar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Datos de ejemplo
const sampleCards = [
  { english: 'Apple', spanish: 'Manzana' },
  { english: 'Banana', spanish: 'Cambur' },
  { english: 'Orange', spanish: 'Naranja' },
  { english: 'Grapes', spanish: 'Uvas' },
  { english: 'Pineapple', spanish: 'Piña' },
  { english: 'Strawberry', spanish: 'Fresa' },
  { english: 'Watermelon', spanish: 'Patilla' },
  { english: 'Mango', spanish: 'Mango' },
  { english: 'Peach', spanish: 'Durazno' },
  { english: 'Cherry', spanish: 'Cereza' },
];

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
          <Text style={styles.btnText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} disabled={index === total - 1} style={[styles.btn, index===total-1 && styles.btnDisabled]}>
          <Text style={styles.btnText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  counter: { color: '#111827', marginBottom: 12, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#3b82f6', width: 16 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnDisabled: { backgroundColor: '#93c5fd' },
  btnText: { color: '#fff', fontWeight: '600' },
  audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginTop: 12 },
  audioText: { color: '#fff', fontWeight: '600' },
  cardContainer: {
    width: 300,
    height: 200,
    marginVertical: 12,
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardFront: {
    backgroundColor: '#3b82f6',
  },
  cardBack: {
    backgroundColor: '#10b981',
  },
  cardSubtitle: { position: 'absolute', top: 12, left: 12, color: 'rgba(255,255,255,0.9)', zIndex: 2 },
  cardText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardHint: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },
});