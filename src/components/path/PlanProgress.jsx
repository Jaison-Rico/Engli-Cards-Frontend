import React, { memo } from 'react';
import { View } from 'react-native';
import { Typography } from 'heroui-native';
import { Info } from 'lucide-react-native';
import PressableScale from '../ui/PressableScale';
import { useAppTheme } from '../../context/ThemeContext';
import { elevation } from '../../theme/theme';

/**
 * Tarjeta de progreso del plan: una sola línea con el porcentaje, una barra
 * fina y un botón de info. Todo el detalle (módulos, niveles, palabras) vive
 * en `PlanSheet`, para no saturar la pantalla de "Jugar".
 */
function PlanProgress({ map, onPressInfo }) {
  const { theme } = useAppTheme();
  const pct = map.totalNodes ? Math.round((map.doneNodes / map.totalNodes) * 100) : 0;

  return (
    <View
      className="mb-5 rounded-[20px] border border-border bg-surface px-4 py-3.5"
      style={elevation(1, theme.mode)}
    >
      <View className="flex-row items-center gap-3">
        <Typography type="body-sm" weight="bold" style={{ color: theme.colors.foreground }}>
          {pct}%
        </Typography>
        <Typography type="body-xs" color="muted" className="flex-1" numberOfLines={1}>
          Plan A1 → B2
        </Typography>
        <PressableScale
          onPress={onPressInfo}
          haptic="light"
          scaleTo={0.9}
          accessibilityLabel="Ver información del plan de estudios"
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.colors.surfaceMuted }}
        >
          <Info color={theme.colors.muted} size={15} strokeWidth={2.2} />
        </PressableScale>
      </View>

      {/* Barra de progreso del plan completo */}
      <View className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: `${theme.colors.primary}1F` }}>
        <View
          style={{ height: '100%', width: `${pct}%`, backgroundColor: theme.colors.primary, borderRadius: 999 }}
        />
      </View>
    </View>
  );
}

export default memo(PlanProgress);
