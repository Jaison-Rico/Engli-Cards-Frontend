import React from 'react';
import { View } from 'react-native';
import { Button, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Estado vacío / de error con icono, texto y acción opcional.
 * `tone="danger"` se usa para errores de carga.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'default',
  className = '',
}) {
  const { theme } = useAppTheme();
  const iconColor = tone === 'danger' ? theme.colors.danger : theme.colors.primary;

  return (
    <View className={`items-center px-8 py-10 ${className}`}>
      {Icon ? (
        <View
          className={`mb-4 h-16 w-16 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-danger/10' : 'bg-accent/10'}`}
        >
          <Icon color={iconColor} size={28} strokeWidth={2} />
        </View>
      ) : null}
      {title ? (
        <Typography type="body" weight="bold" align="center" className="mb-1">
          {title}
        </Typography>
      ) : null}
      {description ? (
        <Typography type="body-sm" color="muted" align="center" className="leading-5">
          {description}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" className="mt-5 px-5" onPress={onAction}>
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
