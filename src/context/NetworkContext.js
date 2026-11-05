import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth, getUserId } from './AuthContext';
import client from '../services/client';
import {
  getNetworkState,
  setDeviceOnline,
  subscribeNetwork,
} from '../services/networkStatus';
import { getSyncStatus, subscribeSync, refreshPendingCount } from '../services/syncStatus';
import { syncAll } from '../services/sync.service';

/**
 * Estado global de conexión y sincronización.
 *
 *  - Escucha NetInfo (red del dispositivo) y el cliente HTTP (si la API responde).
 *  - Lanza la sincronización al recuperar la conexión y al volver a primer plano.
 *  - Si hay red pero el servidor no responde, lo sondea cada cierto tiempo.
 */
const NetworkContext = createContext(null);

const SERVER_PROBE_INTERVAL_MS = 20000;

const isDeviceOnline = (state) =>
  state.isConnected !== false && state.isInternetReachable !== false;

export function NetworkProvider({ children }) {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [network, setNetwork] = useState(getNetworkState());
  const [sync, setSync] = useState(getSyncStatus());
  const wasOnline = useRef(network.deviceOnline && network.serverReachable);

  const syncNow = useCallback(() => {
    if (!userId) return Promise.resolve(null);
    return syncAll(userId).catch((error) => {
      console.warn('No se pudieron sincronizar los cambios offline:', error?.message ?? error);
      return null;
    });
  }, [userId]);

  // Red del dispositivo.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setDeviceOnline(isDeviceOnline(state)));
    NetInfo.fetch().then((state) => setDeviceOnline(isDeviceOnline(state))).catch(() => {});
    return unsubscribe;
  }, []);

  useEffect(() => subscribeNetwork(setNetwork), []);
  useEffect(() => subscribeSync(setSync), []);

  // Al iniciar sesión: contar lo pendiente y sincronizar.
  useEffect(() => {
    if (!userId) return;
    refreshPendingCount(userId);
    syncNow();
  }, [userId, syncNow]);

  // Al pasar de offline a online, sincronizar.
  useEffect(() => {
    const online = network.deviceOnline && network.serverReachable;
    if (online && !wasOnline.current) syncNow();
    wasOnline.current = online;
  }, [network, syncNow]);

  // Al volver a primer plano.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      NetInfo.refresh().catch(() => {});
      syncNow();
    });
    return () => subscription.remove();
  }, [syncNow]);

  // Hay red pero la API no responde: sondear hasta que vuelva.
  useEffect(() => {
    if (!network.deviceOnline || network.serverReachable) return undefined;
    const timer = setInterval(() => {
      // Cualquier respuesta HTTP (incluso 404) marca el servidor como accesible.
      client.get('/', { timeout: 8000 }).catch(() => {});
    }, SERVER_PROBE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [network.deviceOnline, network.serverReachable]);

  const value = {
    isOnline: network.deviceOnline && network.serverReachable,
    deviceOnline: network.deviceOnline,
    serverReachable: network.serverReachable,
    sync,
    syncNow,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork debe usarse dentro de <NetworkProvider>');
  return context;
};
