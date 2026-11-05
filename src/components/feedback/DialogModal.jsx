import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable } from 'react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import { Button, Typography } from 'heroui-native';
import { AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { elevation } from '../../theme/theme';

/**
 * Diálogo modal estilizado (confirmación o aviso). Lo controla FeedbackProvider.
 *
 * dialog: { title, message, confirmText, cancelText|null, destructive, tone, icon }
 */
export default function DialogModal({ dialog, onClose }) {
  const { theme } = useAppTheme();
  // Mantiene el contenido mientras el Modal hace su animación de salida.
  const [content, setContent] = useState(dialog);
  useEffect(() => { if (dialog) setContent(dialog); }, [dialog]);

  const data = dialog ?? content;
  if (!data) return null;

  const tone = data.destructive ? 'danger' : data.tone ?? 'default';
  const toneColor = {
    danger: theme.colors.danger,
    success: theme.colors.success,
    default: theme.colors.primary,
  }[tone] ?? theme.colors.primary;
  const Icon = data.icon ?? (tone === 'danger' ? AlertTriangle : tone === 'success' ? CheckCircle2 : HelpCircle);
  const isAlert = data.cancelText === null;

  return (
    <Modal
      visible={Boolean(dialog)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onClose(false)}
    >
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.colors.backdrop }}>
        <Pressable
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={() => onClose(false)}
          accessibilityLabel="Cerrar"
        />
        <Animated.View
          entering={ZoomIn.springify().damping(20).stiffness(260).mass(0.7)}
          className="w-full max-w-[400px] rounded-3xl border border-border bg-overlay px-6 pb-5 pt-7"
          style={elevation(3, theme.mode)}
          accessibilityViewIsModal
        >
          <Animated.View entering={FadeIn.delay(60)} className="items-center">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${toneColor}1A` }}>
              <Icon color={toneColor} size={26} strokeWidth={2.2} />
            </View>
            <Typography type="h5" weight="bold" align="center" className="mb-2">{data.title}</Typography>
            {data.message ? (
              <Typography type="body-sm" color="muted" align="center" className="leading-5">{data.message}</Typography>
            ) : null}
          </Animated.View>

          <View className="mt-6 gap-2.5">
            <Button
              size="lg"
              variant={tone === 'danger' ? 'danger' : 'primary'}
              className="w-full"
              onPress={() => onClose(true)}
            >
              <Button.Label>{data.confirmText}</Button.Label>
            </Button>
            {!isAlert ? (
              <Button size="lg" variant="ghost" className="w-full" onPress={() => onClose(false)}>
                <Button.Label className="text-muted">{data.cancelText}</Button.Label>
              </Button>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
