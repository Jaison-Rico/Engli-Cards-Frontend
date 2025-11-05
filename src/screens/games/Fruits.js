import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/stylesFrutas';
import fruitsData from './imagesFruits.json';
import FlashCard from '../../components/FlashCard';
import { Ionicons } from '@expo/vector-icons';
// Datos extraídos desde JSON para separación de contenido
const sampleCards = fruitsData;

// Pantalla exportada por defecto (usada por el Navigator)
export default function Fruits() {
  const [index, setIndex] = useState(0);
  const total = sampleCards.length;
  const current = sampleCards[index];

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < total - 1 ? i + 1 : i));

  return (
    <View style={styles.screen}>
      <Text style={styles.counter}>Tarjeta {index + 1} de {total}</Text>
      <FlashCard key={index} item={current} styles={styles} frontLabel="English" backLabel="Español" />

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
