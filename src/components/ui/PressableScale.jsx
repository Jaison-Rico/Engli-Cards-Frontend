import React, { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 28, stiffness: 400, mass: 0.5 };

/**
 * Pressable con feedback táctil: escala ligeramente al presionar y emite un
 * haptic suave. Base de todas las superficies tocables de la app.
 *
 * @param {'selection'|'light'|'medium'|null} haptic tipo de vibración (null = ninguna)
 */
function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled = false,
  haptic = 'selection',
  scaleTo = 0.96,
  style,
  className,
  accessibilityLabel,
  accessibilityRole = 'button',
  hitSlop,
  ...rest
}) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
    opacity: 1 - pressed.value * 0.12,
  }));

  const triggerHaptic = () => {
    if (!haptic) return;
    if (haptic === 'selection') Haptics.selectionAsync().catch(() => {});
    else {
      const style = haptic === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  return (
    <AnimatedPressable
      {...rest}
      className={className}
      style={[animatedStyle, style]}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPressIn={() => { pressed.value = withTiming(1, { duration: 90 }); }}
      onPressOut={() => { pressed.value = withSpring(0, SPRING); }}
      onPress={(event) => {
        triggerHaptic();
        onPress?.(event);
      }}
      onLongPress={onLongPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export default memo(PressableScale);
