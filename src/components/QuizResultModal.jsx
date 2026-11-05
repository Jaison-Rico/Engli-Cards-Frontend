import React from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Trophy, Target, Award, CloudOff } from 'lucide-react-native';
import { Button, Typography } from 'heroui-native';
import { useAppTheme } from '../context/ThemeContext';
import { useNetwork } from '../context/NetworkContext';
import { elevation } from '../theme/theme';

const CONFETTI_URL = 'https://assets5.lottiefiles.com/packages/lf20_u4y3uoxk.json';

export default function QuizResultModal({
  visible,
  score = 0,
  total = 0,
  onOk,
  onReview,
  hasFailed = false,
  title = '¡Quiz completado!',
  okText = 'Continuar',
  description,
  onRequestClose,
  achievement = null,
  savedOffline = false,
}) {
  const { theme } = useAppTheme();
  const { isOnline } = useNetwork();
  const { width, height } = useWindowDimensions();

  const isPerfect = score === total && total > 0;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const message = description ?? (isPerfect
    ? '¡Respondiste todo correctamente! Excelente trabajo.'
    : `Acertaste ${score} de ${total} preguntas.`);
  const Icon = isPerfect ? Trophy : Target;

  const handleRequestClose = () => (onRequestClose ? onRequestClose() : onOk?.());

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={handleRequestClose} statusBarTranslucent>
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.colors.backdrop }}>
        {/* El confeti es remoto: solo se intenta con conexión. */}
        {isPerfect && isOnline ? (
          <LottieView
            source={{ uri: CONFETTI_URL }}
            autoPlay
            loop={false}
            style={{ position: 'absolute', width, height }}
            pointerEvents="none"
          />
        ) : null}

        <Animated.View
          entering={ZoomIn.springify().damping(18).stiffness(220)}
          className="w-full max-w-[400px] items-center rounded-3xl border border-border bg-overlay px-6 pb-6 pt-8"
          style={elevation(3, theme.mode)}
        >
          <View className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${isPerfect ? 'bg-[#FFF5D6] dark:bg-[#3A3014]' : 'bg-accent/10'}`}>
            <Icon color={isPerfect ? '#E0A100' : theme.colors.primary} size={36} strokeWidth={2.2} />
          </View>

          <Typography type="h4" weight="bold" align="center">{isPerfect ? '¡Perfecto!' : title}</Typography>

          <Animated.View entering={FadeInUp.delay(120)} className="my-4 items-center">
            <Typography type="h1" weight="bold" className="text-accent" style={{ fontSize: 44, lineHeight: 50 }}>
              {percent}%
            </Typography>
            <Typography type="body-sm" color="muted" align="center" className="mt-1 leading-5">{message}</Typography>
          </Animated.View>

          {achievement ? (
            <Animated.View
              entering={FadeInUp.delay(320).springify()}
              className="mb-5 w-full flex-row items-center gap-3 rounded-2xl border border-[#F5D97A] bg-[#FFF9E6] px-4 py-3 dark:border-[#5A4A1A] dark:bg-[#2E2610]"
              accessibilityLabel={`Nuevo logro desbloqueado: ${achievement.title}`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FDE9A8] dark:bg-[#4A3D14]">
                <Award color="#C68A00" size={20} />
              </View>
              <View className="flex-1">
                <Typography type="body-xs" weight="bold" className="uppercase tracking-wider text-[#A87500]">
                  ¡Nuevo logro!
                </Typography>
                <Typography type="body-sm" weight="semibold">{achievement.title}</Typography>
                {achievement.description ? (
                  <Typography type="body-xs" color="muted" numberOfLines={2}>{achievement.description}</Typography>
                ) : null}
              </View>
            </Animated.View>
          ) : null}

          {savedOffline ? (
            <View className="mb-5 w-full flex-row items-center gap-2.5 rounded-2xl px-4 py-3" style={{ backgroundColor: theme.colors.warningSoft }}>
              <CloudOff color={theme.colors.warning} size={16} />
              <Typography type="body-xs" weight="medium" className="flex-1" style={{ color: theme.colors.warning }}>
                Sin conexión: tu resultado se guardó y se enviará al volver Internet.
              </Typography>
            </View>
          ) : null}

          <View className="w-full gap-2.5">
            <Button size="lg" className="w-full" onPress={onOk}>
              <Button.Label>{okText}</Button.Label>
            </Button>
            {!isPerfect && hasFailed ? (
              <Button variant="secondary" size="lg" className="w-full" onPress={onReview}>
                <Button.Label className="text-foreground">Repasar errores</Button.Label>
              </Button>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
