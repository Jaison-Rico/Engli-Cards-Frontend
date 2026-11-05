import React, { useEffect } from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { EASE, DURATION, SPRING } from '../theme/motion';

/**
 * Tarjeta con giro 3D. Componente controlado: el padre decide `flipped`.
 * La usan FlashCard y el modo Memoria.
 *
 * Por qué está hecho así (causas de los glitches anteriores):
 *  1. Las caras tienen posición absoluta con tamaño explícito (inline): si el
 *     estilo absoluto se pierde, la cara trasera se apila debajo.
 *  2. `perspective` va primero en el array de transform; si va después de
 *     rotateY, Android lo ignora y el giro se ve plano.
 *  3. backfaceVisibility no es fiable en Android → además se conmuta la
 *     opacidad exactamente en 90° (cuando la cara está de canto e invisible).
 *  4. Las caras no llevan sombra: una sombra/elevation sobre una vista
 *     rotada en 3D se dibuja como un rectángulo deformado. La sombra está en
 *     una "placa" aparte que se estrecha con |cos θ| y se atenúa a mitad
 *     del giro, imitando cómo la tarjeta real proyecta menos sombra de canto.
 *  5. withTiming con curva in-out en vez de spring: un spring con rebote
 *     hace pasar la tarjeta de 180° y muestra la cara equivocada un instante.
 */
export default function FlipCard({
  flipped,
  onPress,
  front,
  back,
  width,
  height,
  radius = 28,
  disabled = false,
  shadowColor = '#07302E',
  shadowStrength = 1,
  plateColor = '#0E9F9A',
  pressScale = 0.98,
  duration = DURATION.flip,
  style,
  accessibilityLabel,
  accessibilityHint,
}) {
  const progress = useSharedValue(flipped ? 1 : 0);
  const press = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(flipped ? 1 : 0, { duration, easing: EASE.inOut });
  }, [flipped, duration]);

  // Escala al presionar + leve "elevación" a mitad del giro.
  const containerStyle = useAnimatedStyle(() => {
    const lift = interpolate(progress.value, [0, 0.5, 1], [0, 1, 0]);
    return {
      opacity: 1 - press.value * 0.06,
      transform: [{ scale: (1 - press.value * (1 - pressScale)) * (1 + lift * 0.035) }],
    };
  });

  const frontStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: progress.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [180, 360])}deg` }],
  }));

  // Sombra dinámica: depende del ángulo y de la presión.
  const plateStyle = useAnimatedStyle(() => {
    const edge = Math.abs(Math.cos(progress.value * Math.PI)); // 1 de frente, 0 de canto
    const depth = edge * (1 - press.value * 0.45) * shadowStrength;
    const scaleX = Math.max(edge, 0.02);
    if (Platform.OS === 'android') {
      return { elevation: 14 * depth, opacity: interpolate(edge, [0, 0.3], [0, 1], Extrapolation.CLAMP), transform: [{ scaleX }] };
    }
    return {
      shadowOpacity: 0.26 * depth,
      shadowRadius: 24 - press.value * 10,
      shadowOffset: { width: 0, height: 16 - press.value * 8 },
      transform: [{ scaleX }, { translateY: press.value * 2 }],
    };
  });

  const box = { position: 'absolute', top: 0, left: 0, width, height, borderRadius: radius };
  const face = [box, { overflow: 'hidden', backfaceVisibility: 'hidden' }];

  return (
    <Animated.View style={[{ width, height }, containerStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => { press.value = withSpring(1, SPRING.snappy); }}
        onPressOut={() => { press.value = withSpring(0, SPRING.snappy); }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, expanded: flipped }}
        style={{ width, height }}
      >
        <Animated.View pointerEvents="none" style={[box, { backgroundColor: plateColor, shadowColor }, plateStyle]} />
        <Animated.View pointerEvents="none" style={[face, frontStyle]}>{front}</Animated.View>
        <Animated.View pointerEvents="none" style={[face, backStyle]}>{back}</Animated.View>
      </Pressable>
    </Animated.View>
  );
}
