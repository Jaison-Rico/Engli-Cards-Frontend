import React, { useState } from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Volume2, RotateCw } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { Typography, Button } from 'heroui-native';
import CachedImage from './CachedImage';
import { useAppTheme } from '../context/ThemeContext';
import { elevation } from '../theme/theme';

// Códigos de idioma candidatos en orden de preferencia
const SPANISH_LANG_CANDIDATES = ['es-419', 'es-ES', 'es-MX', 'es-US', 'es'];
const ENGLISH_LANG_CANDIDATES = ['en-US', 'en-GB', 'en'];

/**
 * Encuentra la primera voz disponible para los candidatos de idioma dados.
 * Si no encuentra ninguna, devuelve el primer candidato como fallback.
 */
async function findBestVoice(candidates) {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) return candidates[0];
    for (const lang of candidates) {
      const match = voices.find(
        (v) => v.language && (v.language === lang || v.language.startsWith(lang.split('-')[0])),
      );
      if (match) return match.language;
    }
  } catch {
    // Si falla la consulta de voces, usar el primer candidato
  }
  return candidates[0];
}

const FLIP_SPRING = { damping: 14, stiffness: 120 };

export default function FlashCard({
  item,
  containerStyle,
  frontKey = 'english',
  backKey = 'spanish',
  imageKey = 'image',
  frontLabel = 'English',
  backLabel = 'Español',
  speakEnabled = true,
  langFront = 'en-US',
  langBack = 'es-ES',
}) {
  // Los hooks van siempre antes de cualquier return (reglas de hooks de React).
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const flip = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }));

  if (!item) return null;

  const cardWidth = Math.min(screenWidth - 48, 380);
  const cardHeight = Math.round(cardWidth * 0.7);

  const handleFlip = () => {
    Haptics.selectionAsync().catch(() => {});
    flip.value = withSpring(isFlipped ? 0 : 1, FLIP_SPRING);
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = async () => {
    if (!speakEnabled) return;
    const text = isFlipped ? item?.[backKey] || item.translation : item?.[frontKey] || item.word;
    const requestedLang = isFlipped ? langBack : langFront;
    if (!text) return;
    try {
      Speech.stop();
      const candidates = requestedLang.startsWith('es') ? SPANISH_LANG_CANDIDATES : ENGLISH_LANG_CANDIDATES;
      const bestLang = await findBestVoice(candidates);
      Speech.speak(text, { language: bestLang, pitch: 1.0, rate: 0.9 });
    } catch {
      try { Speech.speak(text); } catch { /* sin voz disponible */ }
    }
  };

  const imgUri = item?.[imageKey] || item?.image_url;
  const imageStyle = { width: cardWidth * 0.55, height: cardHeight * 0.4, borderRadius: 12 };

  const renderFace = (label, text, hint, style, background) => (
    <Animated.View
      style={[styles.card, { backgroundColor: background }, elevation(2, theme.mode), style]}
    >
      <View className="absolute left-4 top-4 rounded-full bg-white/20 px-2.5 py-1">
        <Typography type="body-xs" weight="semibold" className="text-white">{label}</Typography>
      </View>
      <Typography type="h3" weight="bold" align="center" className="mb-3 px-4 text-white" numberOfLines={3}>
        {text}
      </Typography>
      {imgUri ? <CachedImage uri={imgUri} style={imageStyle} contentFit="contain" /> : null}
      <View className="absolute bottom-4 flex-row items-center gap-1.5">
        <RotateCw color="rgba(255,255,255,0.75)" size={12} />
        <Typography type="body-xs" className="text-white/75">{hint}</Typography>
      </View>
    </Animated.View>
  );

  return (
    <View className="items-center">
      <Pressable
        onPress={handleFlip}
        accessibilityRole="button"
        accessibilityLabel={isFlipped ? `${backLabel}: ${item?.[backKey] || item.translation}` : `${frontLabel}: ${item?.[frontKey] || item.word}`}
        accessibilityHint="Toca para voltear la tarjeta"
        style={[{ width: cardWidth, height: cardHeight, marginVertical: 12 }, containerStyle]}
      >
        {renderFace(frontLabel, item?.[frontKey] || item.word, 'Toca para ver la traducción', frontAnimatedStyle, theme.colors.primary)}
        {renderFace(backLabel, item?.[backKey] || item.translation, 'Toca para volver', backAnimatedStyle, theme.mode === 'dark' ? '#1E9590' : '#0B8C88')}
      </Pressable>

      {speakEnabled ? (
        <Button size="sm" variant="secondary" className="mt-2 px-4" onPress={handleSpeak}>
          <Volume2 size={16} color={theme.colors.foreground} />
          <Button.Label className="text-foreground">Escuchar</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
