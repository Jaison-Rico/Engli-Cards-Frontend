import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable, ScrollView } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'heroui-native';
import { Check } from 'lucide-react-native';
import PressableScale from '../ui/PressableScale';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Hoja de acciones inferior (sustituye a los `Alert.alert` con varias opciones).
 *
 * sheet: { title, message, options: [{ label, icon: LucideIcon, onPress, destructive, selected }] }
 * La lista hace scroll si hay muchas opciones (p. ej. selector de mazo).
 */
export default function ActionSheet({ sheet, onClose }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [content, setContent] = useState(sheet);
  useEffect(() => { if (sheet) setContent(sheet); }, [sheet]);

  const data = sheet ?? content;
  if (!data) return null;

  const handleSelect = (option) => {
    onClose();
    // Deja cerrar la hoja antes de abrir otro modal (p. ej. una confirmación).
    setTimeout(() => option.onPress?.(), 250);
  };

  return (
    <Modal visible={Boolean(sheet)} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: theme.colors.backdrop }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} accessibilityLabel="Cerrar" />
        <Animated.View
          entering={SlideInDown.springify().damping(38).stiffness(360)}
          className="rounded-t-[32px] border-t border-border bg-overlay px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="mb-3 mt-1 h-1 w-10 self-center rounded-full bg-border" />
          {data.title ? (
            <Typography type="body" weight="bold" align="center">{data.title}</Typography>
          ) : null}
          {data.message ? (
            <Typography type="body-sm" color="muted" align="center" className="mt-1">{data.message}</Typography>
          ) : null}

          <ScrollView
            className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface"
            style={{ maxHeight: 380 }}
            bounces={false}
            showsVerticalScrollIndicator={data.options.length > 6}
          >
            {data.options.map((option, index) => {
              const Icon = option.icon;
              const color = option.destructive ? theme.colors.danger : theme.colors.foreground;
              return (
                <PressableScale
                  key={option.key ?? option.label}
                  onPress={() => handleSelect(option)}
                  scaleTo={0.99}
                  className={`flex-row items-center gap-3 px-4 py-4 ${index > 0 ? 'border-t border-border' : ''}`}
                >
                  {Icon ? <Icon color={option.destructive ? theme.colors.danger : theme.colors.muted} size={20} /> : null}
                  <Typography type="body" weight={option.selected ? 'semibold' : 'medium'} className="flex-1" numberOfLines={1} style={{ color }}>
                    {option.label}
                  </Typography>
                  {option.selected ? <Check color={theme.colors.primary} size={20} strokeWidth={2.5} /> : null}
                </PressableScale>
              );
            })}
          </ScrollView>

          <PressableScale
            onPress={onClose}
            scaleTo={0.99}
            className="mt-3 items-center rounded-[22px] border border-border bg-surface py-4"
          >
            <Typography type="body" weight="semibold" color="muted">Cancelar</Typography>
          </PressableScale>
        </Animated.View>
      </View>
    </Modal>
  );
}
