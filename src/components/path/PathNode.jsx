import React, { memo, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BookOpen, Layers2, Grid3x3, Trophy, Lock, Check } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { SPRING } from '../../theme/motion';

const TYPE_ICON = { flashcards: BookOpen, swipe: Layers2, memory: Grid3x3, boss: Trophy };
const DEPTH = 7;

/**
 * Nodo del camino: una ficha sólida con grosor (base más oscura debajo) que
 * se hunde al presionarla. Sin brillos ni neón: profundidad por volumen.
 *  - completado: color de marca + check
 *  - actual: color de marca, anillo que "respira" y etiqueta "Continuar"
 *  - bloqueado: superficie neutra con candado
 * El jefe del módulo es un cuadrado redondeado, un poco más grande.
 */
function PathNode({ node, x, y, palette, onPress }) {
  const isBoss = node.type === 'boss';
  const current = node.status === 'current';
  const locked = node.status === 'locked';
  const size = isBoss ? 76 : current ? 72 : 64;
  const radius = isBoss ? 24 : size / 2;

  const press = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!current) return undefined;
    breathe.value = withRepeat(withTiming(1, { duration: 1700, easing: Easing.out(Easing.quad) }), -1);
    return () => cancelAnimation(breathe);
  }, [current]);

  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * (DEPTH - 2) }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - breathe.value),
    transform: [{ scale: 1 + breathe.value * 0.32 }],
  }));

  const face = locked ? palette.surface : palette.primary;
  const base = locked ? palette.lockedBase : palette.primaryDeep;
  const Icon = locked ? Lock : node.status === 'done' ? Check : TYPE_ICON[node.type] ?? BookOpen;
  const iconColor = locked ? palette.subtle : '#FFFFFF';

  return (
    <View style={[styles.wrap, { left: x - 70, top: y - size / 2 }]} pointerEvents="box-none">
      {current ? (
        <View style={[styles.chip, { backgroundColor: palette.primary, top: -34 }]} pointerEvents="none">
          <Typography type="body-xs" weight="bold" style={{ color: '#fff', letterSpacing: 0.4 }}>Continuar</Typography>
          <View style={[styles.chipArrow, { backgroundColor: palette.primary }]} />
        </View>
      ) : null}

      <Pressable
        onPress={() => onPress(node)}
        onPressIn={() => {
          press.value = withSpring(1, SPRING.snappy);
          Haptics.impactAsync(locked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }}
        onPressOut={() => { press.value = withSpring(0, SPRING.snappy); }}
        accessibilityRole="button"
        accessibilityLabel={`${node.title}${locked ? ', bloqueado' : node.status === 'done' ? ', completado' : current ? ', siguiente paso' : ''}`}
        hitSlop={8}
        style={{ width: size, height: size + DEPTH }}
      >
        {current ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.abs, { width: size, height: size, borderRadius: radius, borderWidth: 3, borderColor: palette.primary }, ringStyle]}
          />
        ) : null}
        {/* Base (grosor) */}
        <View style={[styles.abs, { top: DEPTH, width: size, height: size, borderRadius: radius, backgroundColor: base }]} />
        {/* Cara superior */}
        <Animated.View
          style={[
            styles.abs,
            styles.center,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: face,
              borderWidth: locked ? 1 : current ? 4 : 0,
              borderColor: locked ? palette.border : palette.ring,
            },
            faceStyle,
          ]}
        >
          {!locked ? <View pointerEvents="none" style={[styles.highlight, { borderRadius: radius }]} /> : null}
          <Icon color={iconColor} size={isBoss ? 30 : 26} strokeWidth={node.status === 'done' ? 3 : 2.3} />
        </Animated.View>
      </Pressable>

      <Typography
        type="body-xs"
        weight="semibold"
        align="center"
        numberOfLines={1}
        style={{ marginTop: 8, color: locked ? palette.subtle : palette.foreground, width: 140 }}
      >
        {node.title}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: 140, alignItems: 'center' },
  abs: { position: 'absolute', top: 0, left: 0 },
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  highlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chip: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 2,
  },
  chipArrow: { position: 'absolute', bottom: -4, width: 9, height: 9, transform: [{ rotate: '45deg' }] },
});

export default memo(PathNode);
