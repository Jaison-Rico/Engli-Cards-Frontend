import React from 'react';
import PressableScale from './PressableScale';

/** Botón circular de 44×44 (tamaño táctil mínimo recomendado) para iconos. */
export default function IconButton({
  children,
  onPress,
  accessibilityLabel,
  variant = 'ghost',
  disabled = false,
  className = '',
}) {
  const variants = {
    ghost: '',
    soft: 'bg-default',
    accent: 'bg-accent',
  };
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      scaleTo={0.9}
      className={`h-11 w-11 items-center justify-center rounded-full ${variants[variant] ?? ''} ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      {children}
    </PressableScale>
  );
}
