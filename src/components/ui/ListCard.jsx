import React from 'react';
import { View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { Typography } from 'heroui-native';
import { ChevronRight } from 'lucide-react-native';
import PressableScale from './PressableScale';
import { useAppTheme } from '../../context/ThemeContext';
import { elevation } from '../../theme/theme';

/**
 * Fila de lista tocable con estilo de tarjeta: elemento inicial (icono/imagen),
 * título, subtítulo y accesorio final (por defecto un chevron).
 *
 * Sustituye a `<Card onPress>`: el Card de heroui-native es un View y no
 * responde a toques.
 */
export default function ListCard({
  title,
  subtitle,
  leading,
  trailing,
  badge,
  onPress,
  disabled = false,
  showChevron = true,
  className = '',
  accessibilityLabel,
}) {
  const { theme } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityLabel={accessibilityLabel ?? title}
      className={`flex-row items-center gap-3 rounded-[22px] bg-surface px-4 py-4 border border-border ${className}`}
      entering={FadeInDown.springify().damping(38).stiffness(360)}
      style={elevation(1, theme.mode)}
    >
      {leading ? <View>{leading}</View> : null}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Typography type="body" weight="semibold" numberOfLines={1} className="shrink">
            {title}
          </Typography>
          {badge}
        </View>
        {subtitle ? (
          <Typography type="body-sm" color="muted" numberOfLines={1} className="mt-0.5">
            {subtitle}
          </Typography>
        ) : null}
      </View>
      {trailing}
      {showChevron && onPress ? <ChevronRight color={theme.colors.subtle} size={20} /> : null}
    </PressableScale>
  );
}
