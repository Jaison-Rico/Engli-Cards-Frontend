import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'heroui-native';
import { ArrowLeft } from 'lucide-react-native';
import IconButton from './IconButton';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Cabecera estándar de pantallas de stack: botón atrás, título centrado y
 * acciones a la derecha, con separador fino inferior.
 */
export default function ScreenHeader({
  title,
  onBack,
  right,
  transparent = false,
  bordered = true,
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <View
      className={`${transparent ? '' : 'bg-surface'} ${bordered && !transparent ? 'border-b border-border' : ''}`}
      style={{ paddingTop: insets.top + 4 }}
    >
      <View className="h-14 flex-row items-center justify-between px-2">
        <View className="w-12 items-start">
          {onBack ? (
            <IconButton accessibilityLabel="Volver" onPress={onBack}>
              <ArrowLeft color={theme.colors.foreground} size={22} />
            </IconButton>
          ) : null}
        </View>
        <Typography type="body" weight="bold" numberOfLines={1} className="flex-1 text-center text-[17px]">
          {title}
        </Typography>
        <View className="min-w-12 flex-row items-center justify-end">{right}</View>
      </View>
    </View>
  );
}
