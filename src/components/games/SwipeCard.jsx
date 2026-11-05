import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Typography } from 'heroui-native';
import CachedImage from '../CachedImage';
import { useAppTheme } from '../../context/ThemeContext';
import { SPRING, EASE } from '../../theme/motion';

const RADIUS = 24;

/**
 * Tarjeta superior del mazo Swipe.
 *
 * Toda la física corre en el hilo de UI (worklets):
 *  - onUpdate mueve la tarjeta 1:1 con el dedo y la rota según X.
 *  - onEnd decide: si supera el umbral (28% del ancho) o se lanzó rápido
 *    (|vx| > 900 pt/s), sale volando en esa dirección; si no, vuelve con un
 *    muelle apenas amortiguado.
 *  - Solo al terminar la salida se avisa a JS (scheduleOnRN) → cero renders
 *    durante el arrastre.
 *  - `drag` (compartido con el padre) va de 0 a 1 según lo cerca que está del
 *    umbral: las tarjetas de atrás lo usan para crecer en paralelo.
 */
const SwipeCard = forwardRef(function SwipeCard({ width, height, front, shown, image, drag, onSwiped }, ref) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const gone = useSharedValue(false);
  const threshold = width * 0.28;

  const flyOut = (dir, velocity = 0) => {
    'worklet';
    if (gone.value) return;
    gone.value = true;
    const distance = width * 1.6 * dir;
    tx.value = withTiming(distance, { duration: Math.max(160, 260 - Math.abs(velocity) / 20), easing: EASE.out }, (done) => {
      if (done) scheduleOnRN(onSwiped, dir > 0 ? 'right' : 'left');
    });
    ty.value = withTiming(ty.value + 40, { duration: 240 });
    drag.value = withTiming(1, { duration: 200 });
  };

  // Botones ✓ / ✗ de la pantalla: la misma animación que con el dedo.
  useImperativeHandle(ref, () => ({ swipe: (dir) => flyOut(dir === 'right' ? 1 : -1) }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (gone.value) return;
      tx.value = e.translationX;
      ty.value = e.translationY * 0.4;
      drag.value = Math.min(Math.abs(e.translationX) / threshold, 1);
    })
    .onEnd((e) => {
      if (gone.value) return;
      const flung = Math.abs(e.velocityX) > 900;
      if (Math.abs(tx.value) > threshold || flung) {
        flyOut(Math.sign(flung ? e.velocityX : tx.value) || 1, e.velocityX);
      } else {
        tx.value = withSpring(0, SPRING.settle);
        ty.value = withSpring(0, SPRING.settle);
        drag.value = withSpring(0, SPRING.settle);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-width, 0, width], [-14, 0, 14])}deg` },
    ],
  }));
  const yesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, threshold], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-12deg' }, { scale: interpolate(tx.value, [0, threshold], [0.8, 1], Extrapolation.CLAMP) }],
  }));
  const noStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-threshold, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ rotate: '12deg' }, { scale: interpolate(tx.value, [-threshold, 0], [1, 0.8], Extrapolation.CLAMP) }],
  }));
  // Tinte de color que crece con el arrastre (verde a la derecha, rojo a la izquierda).
  const tintYes = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [0, threshold], [0, 0.35], Extrapolation.CLAMP) }));
  const tintNo = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [-threshold, 0], [0.35, 0], Extrapolation.CLAMP) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, { width, height }, cardStyle]}>
        <SwipeFace width={width} height={height} front={front} shown={shown} image={image} />
        <Animated.View pointerEvents="none" style={[styles.tint, { backgroundColor: '#10B981' }, tintYes]} />
        <Animated.View pointerEvents="none" style={[styles.tint, { backgroundColor: '#F43F5E' }, tintNo]} />
        <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampYes, yesStyle]}>
          <Typography weight="bold" style={styles.stampTextYes}>CORRECTA</Typography>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampNo, noStyle]}>
          <Typography weight="bold" style={styles.stampTextNo}>INCORRECTA</Typography>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

/**
 * Contenido visual (también lo usan las tarjetas de atrás, sin gesto).
 * Usa los colores del tema: antes eran fijos y en modo oscuro la tarjeta
 * quedaba como un bloque blanco.
 */
export function SwipeFace({ width, height, front, shown, image }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  return (
    <View style={[styles.face, { width, height, backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.langPill, { backgroundColor: `${c.primary}1A` }]}>
        <Typography type="body-xs" weight="bold" style={{ color: c.primary, letterSpacing: 0.6 }}>ENGLISH</Typography>
      </View>
      <Typography type="h2" weight="bold" align="center" numberOfLines={2} adjustsFontSizeToFit style={{ color: c.foreground }}>
        {front}
      </Typography>
      {image ? (
        <CachedImage uri={image} style={{ width: width * 0.45, height: height * 0.3, marginVertical: 12, borderRadius: 14 }} contentFit="contain" />
      ) : <View style={{ height: 24 }} />}
      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <Typography type="body-xs" weight="semibold" style={{ color: c.muted, marginBottom: 4 }}>¿Significa…?</Typography>
      <Typography type="h4" weight="bold" align="center" numberOfLines={2} style={{ color: c.primary }}>
        {shown}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: RADIUS,
    shadowColor: '#08302E',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  face: { borderRadius: RADIUS, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tint: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS },
  langPill: {
    position: 'absolute', top: 18, left: 18,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  divider: { width: 48, height: 3, borderRadius: 2, marginBottom: 12 },
  stamp: {
    position: 'absolute', top: 26,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 3,
  },
  stampYes: { left: 22, borderColor: '#10B981' },
  stampNo: { right: 22, borderColor: '#F43F5E' },
  stampTextYes: { color: '#10B981', fontSize: 18, letterSpacing: 1 },
  stampTextNo: { color: '#F43F5E', fontSize: 18, letterSpacing: 1 },
});

export default SwipeCard;
