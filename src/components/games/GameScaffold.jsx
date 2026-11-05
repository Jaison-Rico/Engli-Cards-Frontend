import React from 'react';
import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle, Inbox } from 'lucide-react-native';
import { Spinner, Typography } from 'heroui-native';
import IconButton from '../ui/IconButton';
import EmptyState from '../ui/EmptyState';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Estructura común de los minijuegos: cabecera (volver, título, subtítulo,
 * accesorio derecho) y estados de carga / error / vacío.
 */
export default function GameScaffold({
  title,
  subtitle,
  onBack,
  right,
  loading,
  error,
  onRetry,
  empty,
  emptyText = 'No hay suficientes tarjetas para jugar.',
  children,
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  let body = children;
  if (loading) body = <View className="flex-1 items-center justify-center"><Spinner size="lg" /></View>;
  else if (error) body = <EmptyState icon={AlertCircle} tone="danger" title="No pudimos cargar el juego" description={error} actionLabel="Reintentar" onAction={onRetry} />;
  else if (empty) body = <EmptyState icon={Inbox} title="Sin tarjetas" description={emptyText} actionLabel="Volver" onAction={onBack} />;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 4, paddingBottom: insets.bottom + 12 }}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View className="h-14 flex-row items-center px-3">
        <IconButton accessibilityLabel="Volver" onPress={onBack}>
          <ArrowLeft color={theme.colors.foreground} size={22} />
        </IconButton>
        <View className="mx-2 flex-1">
          <Typography type="body" weight="bold" numberOfLines={1}>{title}</Typography>
          {subtitle ? <Typography type="body-xs" color="muted" numberOfLines={1}>{subtitle}</Typography> : null}
        </View>
        {right}
      </View>
      <View className="flex-1">{body}</View>
    </View>
  );
}
