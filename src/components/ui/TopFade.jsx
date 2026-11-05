import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Difuminado superior para pantallas con scroll: el contenido se desvanece
 * suavemente al pasar por debajo de la barra de estado en lugar de cortarse.
 *
 * Es una capa estática (sin listeners de scroll → cero coste por frame):
 * opaca bajo la barra de estado y transparente `fade` píxeles más abajo.
 * Cuando no hay contenido detrás, coincide con el fondo y es invisible.
 *
 * @param {boolean} safeArea incluir la altura de la barra de estado (pestañas)
 * @param {number}  fade     altura del degradado en px
 */
export default function TopFade({ safeArea = true, fade = 36, color }) {
  const id = `tf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const solid = safeArea ? insets.top : 0;
  const height = solid + fade;
  const c = color ?? theme.colors.background;
  const solidStop = height > 0 ? solid / height : 0;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c} stopOpacity="1" />
            <Stop offset={solidStop} stopColor={c} stopOpacity="0.96" />
            <Stop offset={solidStop + (1 - solidStop) * 0.5} stopColor={c} stopOpacity="0.6" />
            <Stop offset="1" stopColor={c} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
