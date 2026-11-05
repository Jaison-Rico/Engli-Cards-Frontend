import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Typography } from 'heroui-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';

/** Mensaje en línea dentro de un formulario (error, éxito o información). */
export default function InlineAlert({ message, tone = 'danger', className = '' }) {
  const { theme } = useAppTheme();
  if (!message) return null;
  const color = { danger: theme.colors.danger, success: theme.colors.success, info: theme.colors.primary }[tone];
  const Icon = { danger: AlertCircle, success: CheckCircle2, info: Info }[tone];

  return (
    <Animated.View entering={FadeIn.duration(180)} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View
        className={`flex-row items-start gap-2.5 rounded-[18px] px-4 py-3.5 ${className}`}
        style={{ backgroundColor: `${color}14`, borderWidth: 1, borderColor: `${color}33` }}
      >
        <Icon color={color} size={16} style={{ marginTop: 2 }} />
        <Typography type="body-sm" className="flex-1 leading-5" style={{ color }}>{message}</Typography>
      </View>
    </Animated.View>
  );
}
