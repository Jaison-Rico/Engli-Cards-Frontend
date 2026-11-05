import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'heroui-native';
import { CheckCircle2, AlertCircle, Info, CloudOff } from 'lucide-react-native';
import PressableScale from '../ui/PressableScale';
import { useAppTheme } from '../../context/ThemeContext';
import { elevation } from '../../theme/theme';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info, offline: CloudOff };

/**
 * Toast flotante en la parte inferior (por encima de la barra de pestañas).
 * Se descarta solo o al tocarlo. No bloquea la interacción con la pantalla.
 */
export default function Toast({ toast, onDismiss }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  if (!toast) return null;

  const accent = {
    success: theme.colors.success,
    error: theme.colors.danger,
    info: theme.colors.primary,
    offline: theme.colors.warning,
  }[toast.type] ?? theme.colors.primary;
  const Icon = ICONS[toast.type] ?? Info;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 76, alignItems: 'center' }}
    >
      <Animated.View
        key={toast.id}
        entering={FadeInDown.springify().damping(18).stiffness(220)}
        exiting={FadeOutDown.duration(180)}
        style={{ width: '100%', maxWidth: 480, paddingHorizontal: 16 }}
      >
        <PressableScale
          onPress={onDismiss}
          haptic={null}
          scaleTo={0.98}
          accessibilityRole="alert"
          accessibilityLabel={toast.message ? `${toast.title}. ${toast.message}` : toast.title}
          className="flex-row items-center gap-3 rounded-2xl border border-border bg-overlay px-4 py-3"
          style={elevation(3, theme.mode)}
        >
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1F` }}>
            <Icon color={accent} size={18} strokeWidth={2.4} />
          </View>
          <View className="flex-1">
            <Typography type="body-sm" weight="semibold">{toast.title}</Typography>
            {toast.message ? (
              <Typography type="body-xs" color="muted" className="mt-0.5 leading-4">{toast.message}</Typography>
            ) : null}
          </View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}
