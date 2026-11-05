import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';

/**
 * Degradado real con react-native-svg (ya incluido en el binario: no requiere
 * un build nativo nuevo como expo-linear-gradient). Ocupa todo el padre.
 *
 * @param {string[]} colors     colores de inicio → fin
 * @param {'vertical'|'diagonal'} direction
 * @param {boolean} sheen       añade un brillo radial arriba (efecto glass)
 */
export default function GradientFill({ colors, direction = 'diagonal', radius = 0, sheen = false, style }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [x2, y2] = direction === 'vertical' ? ['0', '1'] : ['1', '1'];
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Defs>
        <LinearGradient id={`g${id}`} x1="0" y1="0" x2={x2} y2={y2}>
          {colors.map((c, i) => (
            <Stop key={i} offset={colors.length === 1 ? 0 : i / (colors.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
        {sheen ? (
          <RadialGradient id={`s${id}`} cx="0.25" cy="0" rx="0.9" ry="0.7" fx="0.25" fy="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        ) : null}
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" rx={radius} ry={radius} fill={`url(#g${id})`} />
      {sheen ? <Rect x="0" y="0" width="100%" height="100%" rx={radius} ry={radius} fill={`url(#s${id})`} /> : null}
    </Svg>
  );
}
