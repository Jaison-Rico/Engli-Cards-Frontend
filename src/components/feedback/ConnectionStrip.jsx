import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'heroui-native';
import { WifiOff, CloudUpload, CheckCircle2, ServerCrash } from 'lucide-react-native';
import PressableScale from '../ui/PressableScale';
import { useNetwork } from '../../context/NetworkContext';
import { useAppTheme } from '../../context/ThemeContext';

const STRIP_HEIGHT = 34;
const ANIMATION_MS = 240;
const SYNCED_VISIBLE_MS = 2200;

/**
 * Franja de estado de conexión bajo la barra de estado.
 *
 * En lugar de flotar sobre la interfaz (y tapar títulos o botones), empuja el
 * contenido hacia abajo: mientras está visible, las pantallas reciben un
 * `insets.top = 0` porque la franja ya ocupa la zona segura superior.
 *
 * Estados: sin red · servidor no disponible · sincronizando · pendiente · sincronizado.
 */
export default function ConnectionStrip({ children }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { deviceOnline, serverReachable, sync, syncNow } = useNetwork();

  const [showSynced, setShowSynced] = useState(false);
  const previousSyncState = useRef(sync.state);

  // "Todo sincronizado" se muestra un momento tras terminar una sincronización.
  useEffect(() => {
    if (sync.state === 'synced' && previousSyncState.current !== 'synced') {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), SYNCED_VISIBLE_MS);
      previousSyncState.current = sync.state;
      return () => clearTimeout(timer);
    }
    previousSyncState.current = sync.state;
    return undefined;
  }, [sync.state]);

  const pendingLabel = sync.pending === 1 ? '1 cambio' : `${sync.pending} cambios`;
  let status = null;
  if (!deviceOnline) {
    status = {
      key: 'offline',
      icon: WifiOff,
      tone: 'warning',
      text: sync.pending > 0 ? `Sin conexión · ${pendingLabel} guardados en el dispositivo` : 'Sin conexión · tus cambios se guardan en el dispositivo',
    };
  } else if (!serverReachable) {
    status = { key: 'server', icon: ServerCrash, tone: 'warning', text: 'No se puede conectar con el servidor' };
  } else if (sync.state === 'syncing') {
    status = { key: 'syncing', spinner: true, tone: 'primary', text: `Sincronizando ${pendingLabel}…` };
  } else if (sync.state === 'pending' && sync.pending > 0) {
    status = { key: 'pending', icon: CloudUpload, tone: 'primary', text: `${pendingLabel} por sincronizar · toca para reintentar`, onPress: syncNow };
  } else if (showSynced) {
    status = { key: 'synced', icon: CheckCircle2, tone: 'success', text: 'Todo sincronizado' };
  }

  // Se conserva el último estado mientras la franja se oculta con animación.
  const [rendered, setRendered] = useState(status);
  const visible = Boolean(status);
  const height = useSharedValue(visible ? STRIP_HEIGHT : 0);

  useEffect(() => {
    if (status) setRendered(status);
    height.value = withTiming(visible ? STRIP_HEIGHT : 0, {
      duration: ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    if (!visible) {
      const timer = setTimeout(() => setRendered(null), ANIMATION_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, status?.key, status?.text]);

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));

  const mounted = Boolean(rendered);
  const current = rendered ?? status;
  const tones = {
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    success: { bg: theme.mode === 'dark' ? 'rgba(34,197,94,0.14)' : '#E7F6EC', fg: theme.colors.success },
  };
  const tone = tones[current?.tone] ?? tones.primary;
  const Icon = current?.icon;

  return (
    <View style={{ flex: 1 }}>
      {mounted ? (
        <View style={{ backgroundColor: tone.bg, paddingTop: insets.top }}>
          <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
          <Animated.View style={[{ overflow: 'hidden' }, animatedStyle]}>
            <PressableScale
              onPress={current?.onPress}
              disabled={!current?.onPress}
              haptic={current?.onPress ? 'light' : null}
              scaleTo={0.99}
              accessibilityRole={current?.onPress ? 'button' : 'text'}
              accessibilityLiveRegion="polite"
              accessibilityLabel={current?.text}
              className="flex-row items-center justify-center gap-2 px-4"
              style={{ height: STRIP_HEIGHT }}
            >
              {current?.spinner ? <ActivityIndicator size="small" color={tone.fg} /> : null}
              {Icon ? <Icon color={tone.fg} size={15} strokeWidth={2.4} /> : null}
              <Typography type="body-xs" weight="semibold" numberOfLines={1} style={{ color: tone.fg }}>
                {current?.text}
              </Typography>
            </PressableScale>
          </Animated.View>
          <View style={{ height: 0.5, backgroundColor: theme.colors.border }} />
        </View>
      ) : null}

      <SafeAreaInsetsContext.Provider value={mounted ? { ...insets, top: 0 } : insets}>
        <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}
