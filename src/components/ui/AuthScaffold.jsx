import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import IconButton from './IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { elevation } from '../../theme/theme';

const LOGO = require('../../../assets/logo.png');

/**
 * Estructura común de las pantallas de autenticación: teclado, scroll, botón
 * atrás opcional y cabecera con logo o icono.
 */
export default function AuthScaffold({ children, onBack, icon: Icon, title, subtitle, showLogo = false }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Fondo decorativo: halos suaves de marca */}
      <Animated.View entering={FadeIn.duration(350)} pointerEvents="none" style={{ position: 'absolute', top: -140, right: -90, width: 320, height: 320, borderRadius: 160, backgroundColor: theme.colors.primary, opacity: theme.mode === 'dark' ? 0.16 : 0.1 }} />
      <Animated.View entering={FadeIn.duration(450)} pointerEvents="none" style={{ position: 'absolute', top: 120, left: -120, width: 240, height: 240, borderRadius: 120, backgroundColor: theme.colors.primary, opacity: theme.mode === 'dark' ? 0.1 : 0.06 }} />
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (onBack ? 4 : 56),
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {onBack ? (
          <View className="-ml-2 mb-4 h-14 justify-center">
            <IconButton accessibilityLabel="Volver" onPress={onBack}>
              <ArrowLeft color={theme.colors.foreground} size={22} />
            </IconButton>
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.springify().damping(38).stiffness(360)} className="mb-9 items-center">
          {showLogo ? (
            <View className="mb-5 h-24 w-24 items-center justify-center overflow-hidden rounded-[30px] border border-border bg-surface" style={elevation(3, theme.mode)}>
              <Image source={LOGO} style={{ width: 84, height: 84 }} resizeMode="contain" />
            </View>
          ) : Icon ? (
            <View className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-accent/10">
              <Icon color={theme.colors.primary} size={28} strokeWidth={2.2} />
            </View>
          ) : null}
          {title ? <Typography type="h2" weight="bold" align="center" className="tracking-tight">{title}</Typography> : null}
          {subtitle ? (
            <Typography type="body-sm" color="muted" align="center" className="mt-2 max-w-[300px] text-[15px] leading-[22px]">{subtitle}</Typography>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(38).stiffness(360)}>
          {children}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
