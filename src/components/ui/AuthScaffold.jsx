import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from 'heroui-native';
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
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (onBack ? 4 : 40),
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

        <View className="mb-8 items-center">
          {showLogo ? (
            <View className="mb-4 h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-surface" style={elevation(2, theme.mode)}>
              <Image source={LOGO} style={{ width: 72, height: 72 }} resizeMode="contain" />
            </View>
          ) : Icon ? (
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Icon color={theme.colors.primary} size={28} strokeWidth={2.2} />
            </View>
          ) : null}
          {title ? <Typography type="h3" weight="bold" align="center" className="tracking-tight">{title}</Typography> : null}
          {subtitle ? (
            <Typography type="body-sm" color="muted" align="center" className="mt-1.5 max-w-[320px] leading-5">{subtitle}</Typography>
          ) : null}
        </View>

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
