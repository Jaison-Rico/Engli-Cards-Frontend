import { countPendingWork } from './localDatabase';

/**
 * Estado observable de la sincronización offline.
 *
 * state:
 *  - 'idle'     nada pendiente
 *  - 'pending'  hay cambios locales esperando conexión
 *  - 'syncing'  enviando cambios al servidor
 *  - 'synced'   se acaba de terminar de sincronizar (estado transitorio)
 */
let status = { state: 'idle', pending: 0, lastSyncedAt: null };
const listeners = new Set();

export const getSyncStatus = () => status;

export const setSyncStatus = (patch) => {
  status = { ...status, ...patch };
  listeners.forEach((listener) => listener(status));
};

export const subscribeSync = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Recalcula cuántos cambios quedan en cola (se llama tras encolar algo). */
export const refreshPendingCount = async (userId) => {
  if (!userId) return 0;
  try {
    const pending = await countPendingWork(userId);
    if (status.state !== 'syncing') {
      setSyncStatus({ pending, state: pending > 0 ? 'pending' : status.state === 'pending' ? 'idle' : status.state });
    } else {
      setSyncStatus({ pending });
    }
    return pending;
  } catch (error) {
    console.warn('No se pudo contar el trabajo pendiente:', error);
    return status.pending;
  }
};
