import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { Typography, Button } from 'heroui-native';

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
  if (!item) return null;

  const flip = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }));

  const handleFlip = () => {
    flip.value = withSpring(isFlipped ? 0 : 1, { damping: 10, stiffness: 100 });
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = () => {
    if (!speakEnabled) return;
    const text = isFlipped ? item?.[backKey] || item.translation : item?.[frontKey] || item.word;
    const language = isFlipped ? langBack : langFront;
    if (!text) return;
    try {
      Speech.stop();
      Speech.speak(text, { language, pitch: 1.0, rate: 1.0 });
    } catch {}
  };

  const imgUri = item?.[imageKey] || item?.image_url;

  return (
    <View className="items-center">
      <TouchableOpacity onPress={handleFlip} style={[styles.cardContainer, containerStyle]}>
        {/* Front */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Typography type="body-xs" className="absolute top-3 left-3 text-white/80">{frontLabel}</Typography>
          <Typography type="h4" weight="bold" className="text-white text-center mb-3">
            {item?.[frontKey] || item.word}
          </Typography>
          {imgUri ? <Image source={{ uri: imgUri }} style={styles.cardImage} /> : null}
          <Typography type="body-xs" className="text-white/70 mt-2">Toca para ver traducción</Typography>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Typography type="body-xs" className="absolute top-3 left-3 text-white/80">{backLabel}</Typography>
          <Typography type="h4" weight="bold" className="text-white text-center mb-3">
            {item?.[backKey] || item.translation}
          </Typography>
          {imgUri ? <Image source={{ uri: imgUri }} style={styles.cardImage} /> : null}
          <Typography type="body-xs" className="text-white/70 mt-2">Toca para volver</Typography>
        </Animated.View>
      </TouchableOpacity>

      {speakEnabled && (
        <Button size="sm" className="mt-3 rounded-full" onPress={handleSpeak}>
          <Ionicons name="volume-high" size={18} color="#fff" />
          <Button.Label>Escuchar</Button.Label>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { width: 300, height: 200, marginVertical: 12 },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardFront: { backgroundColor: '#12B5B0' },
  cardBack: { backgroundColor: '#0E9A96' },
  cardImage: { width: 200, height: 100, resizeMode: 'contain', borderRadius: 8 },
});
