import React from 'react';
import { View, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import PressableScale from './PressableScale';
import { useAppTheme } from '../../context/ThemeContext';

/** Campo de búsqueda con icono y botón para limpiar. */
export default function SearchField({ value, onChangeText, placeholder = 'Buscar…', className = '' }) {
  const { theme } = useAppTheme();

  return (
    <View className={`h-12 flex-row items-center gap-2 rounded-2xl border border-border bg-default px-3.5 ${className}`}>
      <Search color={theme.colors.muted} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.subtle}
        className="flex-1 text-[15px] text-foreground"
        style={{ paddingVertical: 0 }}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <PressableScale
          onPress={() => onChangeText('')}
          haptic={null}
          hitSlop={8}
          accessibilityLabel="Limpiar búsqueda"
          className="h-5 w-5 items-center justify-center rounded-full bg-muted/30"
        >
          <X color={theme.colors.surface} size={12} strokeWidth={3} />
        </PressableScale>
      ) : null}
    </View>
  );
}
