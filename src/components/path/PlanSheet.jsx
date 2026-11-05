import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable, ScrollView } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'heroui-native';
import { X, Check } from 'lucide-react-native';
import PressableScale from '../ui/PressableScale';
import { useAppTheme } from '../../context/ThemeContext';
import { TOTAL_WORDS } from '../../data/curriculum';

/**
 * Detalle del plan de estudios (A1 → B2). Se abre desde el botón de info de la
 * tarjeta de progreso. Hoja inferior con la lista de módulos agrupados por
 * nivel MCER: cada módulo muestra su progreso y si está completado.
 */
export default function PlanSheet({ visible, onClose, map }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [mounted, setMounted] = useState(visible);

  useEffect(() => { if (visible) setMounted(true); }, [visible]);

  // El mapa puede tardar en cargar: se sale después de los hooks para no
  // romper el orden de llamadas.
  if (!map) return null;

  const LEVELS = ['A1', 'A2', 'B1', 'B2'];
  const pct = map.totalNodes ? Math.round((map.doneNodes / map.totalNodes) * 100) : 0;

  const byLevel = LEVELS.map((level) => {
    const mods = map.modules.filter((m) => m.level === level);
    const total = mods.reduce((n, m) => n + m.nodes.length, 0);
    const done = mods.reduce((n, m) => n + m.completed, 0);
    return { level, mods, total, done };
  }).filter((g) => g.mods.length > 0);

  const handleClose = () => {
    onClose?.();
    // Espera a que termine la animación de salida antes de desmontar.
    setTimeout(() => setMounted(false), 260);
  };

  return (
    <Modal visible={mounted} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: theme.colors.backdrop }}>
        <Pressable
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={handleClose}
          accessibilityLabel="Cerrar"
        />

        <Animated.View
          entering={SlideInDown.springify().damping(38).stiffness(360)}
          className="max-h-[85%] rounded-t-[28px] border-t border-border bg-overlay"
          style={{ paddingBottom: insets.bottom + 12 }}
          accessibilityViewIsModal
        >
          {/* Cabecera */}
          <View className="flex-row items-start justify-between px-5 pb-4 pt-5">
            <View className="flex-1 pr-3">
              <Typography type="body-xs" weight="bold" color="muted" className="uppercase tracking-wider">
                Plan de estudios
              </Typography>
              <Typography type="h5" weight="bold" className="mt-0.5">
                {pct}% completado
              </Typography>
            </View>
            <PressableScale
              onPress={handleClose}
              haptic="light"
              scaleTo={0.92}
              accessibilityLabel="Cerrar"
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.colors.surfaceMuted }}
            >
              <X color={theme.colors.muted} size={18} strokeWidth={2.2} />
            </PressableScale>
          </View>

          <ScrollView className="px-5" bounces={false} showsVerticalScrollIndicator={false}>
            {/* Resumen */}
            <View className="mb-5 flex-row items-center gap-2 rounded-[18px] border border-border bg-surface px-4 py-3">
              <TextStat value={`${map.doneNodes}/${map.totalNodes}`} label="nodos" />
              <Dot />
              <TextStat value={String(map.modules.length)} label="módulos" />
              <Dot />
              <TextStat value={String(TOTAL_WORDS)} label="palabras" />
            </View>

            {/* Módulos por nivel */}
            {byLevel.map((group) => (
              <View key={group.level} className="mb-5">
                <View className="mb-2 flex-row items-baseline justify-between">
                  <Typography type="body-sm" weight="bold">{group.level}</Typography>
                  <Typography type="body-xs" color="muted">
                    {group.done}/{group.total} nodos
                  </Typography>
                </View>

                <View className="overflow-hidden rounded-[18px] border border-border bg-surface">
                  {group.mods.map((mod, i) => {
                    const complete = mod.completed === mod.nodes.length;
                    const started = mod.completed > 0;
                    return (
                      <View
                        key={mod.id}
                        className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                      >
                        <View
                          className="h-6 w-6 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: complete
                              ? theme.colors.primary
                              : started
                                ? `${theme.colors.primary}1A`
                                : theme.colors.surfaceMuted,
                          }}
                        >
                          {complete ? (
                            <Check color={theme.colors.onPrimary} size={13} strokeWidth={3} />
                          ) : (
                            <Typography
                              type="body-xs"
                              weight="bold"
                              style={{ color: started ? theme.colors.primary : theme.colors.subtle }}
                            >
                              {mod.index + 1}
                            </Typography>
                          )}
                        </View>

                        <View className="flex-1">
                          <Typography type="body-sm" weight="semibold" numberOfLines={1}>
                            {mod.title}
                          </Typography>
                          <Typography type="body-xs" color="muted" numberOfLines={1}>
                            {mod.subtitle}
                          </Typography>
                        </View>

                        <Typography
                          type="body-xs"
                          weight="semibold"
                          style={{ color: complete ? theme.colors.primary : theme.colors.muted }}
                        >
                          {mod.completed}/{mod.nodes.length}
                        </Typography>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View className="h-2" />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Separador vertical entre datos del resumen. */
function Dot() {
  return <View className="h-1 w-1 rounded-full bg-border" />;
}

/** Dato del resumen: valor grande + etiqueta. */
function TextStat({ value, label }) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-1 items-center">
      <Typography type="body-sm" weight="bold" style={{ color: theme.colors.foreground }}>
        {value}
      </Typography>
      <Typography type="body-xs" color="muted">{label}</Typography>
    </View>
  );
}
