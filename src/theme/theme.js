import { Appearance, Platform, StyleSheet } from 'react-native';

/**
 * Paleta para valores que se pasan como prop (iconos de lucide, gráficas,
 * StatusBar…). Las clases de uniwind (`bg-surface`, `text-muted`…) usan las
 * variables de `global.css`; ambas fuentes están alineadas en tono.
 */
const light = {
  primary: '#0FA9A4',
  primarySoft: '#E2F4F2',
  onPrimary: '#FFFFFF',
  background: '#F5F9F9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF5F4',
  foreground: '#0F2B2A',
  muted: '#5C7877',
  subtle: '#9BB3B1',
  border: '#E0EBEA',
  success: '#16A34A',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#DC2626',
  flame: '#F97316',
  backdrop: 'rgba(8, 24, 24, 0.45)',
};

const dark = {
  primary: '#2CC4BE',
  primarySoft: 'rgba(44, 196, 190, 0.14)',
  onPrimary: '#04201F',
  background: '#0E1617',
  surface: '#162122',
  surfaceMuted: '#1D2A2B',
  foreground: '#E9F3F2',
  muted: '#93A9A8',
  subtle: '#5E7473',
  border: 'rgba(255, 255, 255, 0.08)',
  success: '#22C55E',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  danger: '#F87171',
  flame: '#FB923C',
  backdrop: 'rgba(0, 0, 0, 0.6)',
};

// Alias de nombres antiguos para no romper usos existentes.
const withAliases = (palette) => ({
  ...palette,
  card: palette.surface,
  mutedForeground: palette.muted,
  primaryLight: palette.primary,
  primaryDark: palette.foreground,
});

export const tokens = {
  radius: { sm: 10, md: 14, lg: 18, xl: 22, xxl: 28, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  hairline: StyleSheet.hairlineWidth,
};

/** Sombra suave y uniforme: en iOS sombra difusa, en Android elevación baja. */
export const elevation = (level = 1, mode = 'light') => {
  const opacity = mode === 'dark' ? 0.4 : [0, 0.05, 0.08, 0.12][level] ?? 0.08;
  return Platform.select({
    ios: {
      shadowColor: '#08302E',
      shadowOffset: { width: 0, height: level * 3 },
      shadowOpacity: opacity,
      shadowRadius: level * 10,
    },
    android: { elevation: level * 2, shadowColor: '#08302E' },
    default: { boxShadow: `0 ${level * 3}px ${level * 12}px rgba(8,48,46,${opacity})` },
  });
};

export const getTheme = (scheme) => {
  const mode = scheme || Appearance.getColorScheme() || 'light';
  const colors = withAliases(mode === 'dark' ? dark : light);
  return { colors, tokens, mode };
};

export default getTheme;
