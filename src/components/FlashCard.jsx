import React, { useCallback, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Volume2, RotateCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography } from 'heroui-native';
import CachedImage from './CachedImage';
import FlipCard, { GlassBorder } from './FlipCard';
import GradientFill from './ui/GradientFill';
import PressableScale from './ui/PressableScale';
import { useAppTheme } from '../context/ThemeContext';
import { speak } from '../services/tts';

const RADIUS = 28;

/** Paletas de cada cara: anverso verde azulado, reverso índigo. */
const PALETTE = {
  light: { front: ['#17B3AD', '#0B8C88', '#07726E'], back: ['#6474F0', '#4A5BD4', '#3443B5'] },
  dark: { front: ['#149E99', '#0C7B77', '#085E5B'], back: ['#5262D6', '#3B4FA8', '#2B3A86'] },
};

/** Cara de la tarjeta: degradado + brillo glass + borde fino translúcido. */
function CardFace({ colors, label, text, hint, imgUri, width, height }) {
  return (
    <View style={[styles.face, { width, height }]}>
      <GradientFill colors={colors} radius={RADIUS} sheen />
      <GlassBorder radius={RADIUS} />
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
        style={[styles.white, styles.title]}
      >
        {text}
      </Typography>
      {imgUri ? (
        <CachedImage uri={imgUri} style={{ width: width * 0.5, height: height * 0.36, borderRadius: 14 }} contentFit="contain" />
      ) : null}
      <View style={styles.hint}>
        <RotateCw color="rgba(255,255,255,0.9)" size={12} />
        <Typography type="body-xs" weight="medium" style={{ color: 'rgba(255,255,255,0.92)' }}>{hint}</Typography>
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
  const palette = PALETTE[theme.mode === 'dark' ? 'dark' : 'light'];
  const imgUri = item?.[imageKey] || item?.image_url;

  return (
    <Animated.View entering={FadeInDown.springify().damping(38).stiffness(360)} className="items-center">
      <FlipCard
        flipped={isFlipped}
        onPress={handleFlip}
        width={width}
        height={height}
        radius={RADIUS}
        plateColor={isFlipped ? palette.back[1] : palette.front[1]}
        shadowColor={theme.mode === 'dark' ? '#000' : '#07302E'}
        style={[{ marginVertical: 16 }, containerStyle]}
        accessibilityLabel={isFlipped ? `${backLabel}: ${backText}` : `${frontLabel}: ${frontText}`}
        accessibilityHint="Toca para voltear la tarjeta"
        front={<CardFace colors={palette.front} label={frontLabel} text={frontText} hint="Toca para ver la traducción" imgUri={imgUri} width={width} height={height} />}
        back={<CardFace colors={palette.back} label={backLabel} text={backText} hint="Toca para volver" imgUri={imgUri} width={width} height={height} />}
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
  title: {
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute', left: 16, top: 16,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  hint: {
    position: 'absolute', bottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
});
