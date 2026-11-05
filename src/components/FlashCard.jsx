import React, { useCallback, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Volume2, RotateCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography } from 'heroui-native';
import CachedImage from './CachedImage';
import FlipCard from './FlipCard';
import PressableScale from './ui/PressableScale';
import { shade } from '../theme/theme';
import { useAppTheme } from '../context/ThemeContext';
import { speak } from '../services/tts';

const RADIUS = 28;

/** Cara de la tarjeta: color sólido de la paleta, sin efectos añadidos. */
function CardFace({ color, label, text, hint, imgUri, width, height }) {
  return (
    <View style={[styles.face, { width, height, backgroundColor: color }]}>
      <View style={styles.badge}>
        <Typography type="body-xs" weight="semibold" style={styles.white}>{label}</Typography>
      </View>
      <Typography
        type="h2"
        weight="bold"
        align="center"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        className="mb-3 px-8"
        style={styles.white}
      >
        {text}
      </Typography>
      {imgUri ? (
        <CachedImage uri={imgUri} style={{ width: width * 0.5, height: height * 0.36, borderRadius: 14 }} contentFit="contain" />
      ) : null}
      <View style={styles.hint}>
        <RotateCw color="rgba(255,255,255,0.75)" size={12} />
        <Typography type="body-xs" weight="medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{hint}</Typography>
      </View>
    </View>
  );
}

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
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [isFlipped, setIsFlipped] = useState(false);

  const frontText = item?.[frontKey] || item?.word;
  const backText = item?.[backKey] || item?.translation;

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsFlipped((v) => !v);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!speakEnabled) return;
    // Cada cara habla con la voz de su idioma (prop explícita > detección).
    if (isFlipped) speak(backText, { lang: langBack });
    else speak(frontText, { lang: langFront });
  }, [speakEnabled, isFlipped, frontText, backText, langFront, langBack]);

  if (!item) return null;

  const width = Math.min(screenWidth - 48, 380);
  const height = Math.round(width * 0.74);
  // Anverso: color de marca. Reverso: el mismo tono más profundo (armónico).
  const frontColor = theme.colors.primary;
  const backColor = shade(theme.colors.primary, -0.32);
  const imgUri = item?.[imageKey] || item?.image_url;

  return (
    <Animated.View entering={FadeInDown.springify().damping(38).stiffness(360)} className="items-center">
      <FlipCard
        flipped={isFlipped}
        onPress={handleFlip}
        width={width}
        height={height}
        radius={RADIUS}
        plateColor={isFlipped ? backColor : frontColor}
        shadowColor={theme.mode === 'dark' ? '#000' : '#07302E'}
        style={[{ marginVertical: 16 }, containerStyle]}
        accessibilityLabel={isFlipped ? `${backLabel}: ${backText}` : `${frontLabel}: ${frontText}`}
        accessibilityHint="Toca para voltear la tarjeta"
        front={<CardFace color={frontColor} label={frontLabel} text={frontText} hint="Toca para ver la traducción" imgUri={imgUri} width={width} height={height} />}
        back={<CardFace color={backColor} label={backLabel} text={backText} hint="Toca para volver" imgUri={imgUri} width={width} height={height} />}
      />

      {speakEnabled ? (
        <PressableScale
          onPress={handleSpeak}
          haptic="light"
          accessibilityLabel={`Escuchar en ${isFlipped ? backLabel : frontLabel}`}
          className="mt-3 flex-row items-center gap-2 rounded-full border border-border bg-surface px-5 py-3"
        >
          <Volume2 size={18} color={theme.colors.primary} />
          <Typography type="body-sm" weight="semibold">Escuchar · {isFlipped ? backLabel : frontLabel}</Typography>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: RADIUS, justifyContent: 'center', alignItems: 'center', padding: 24 },
  white: { color: '#FFFFFF' },
  badge: {
    position: 'absolute', left: 16, top: 16,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  hint: {
    position: 'absolute', bottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
});
