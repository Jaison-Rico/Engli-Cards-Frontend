import client from './client';
import {
  getPendingChanges,
  removePendingChange,
  recordPendingChangeFailure,
  remapEntityId,
  removeLocalDeck,
  removeLocalFlashcard,
  countPendingWork,
} from './localDatabase';
import { syncPendingQuizProgress } from './progress.service';
import { getNetworkState } from './networkStatus';
import { setSyncStatus, getSyncStatus } from './syncStatus';
import { isNetworkError, isRetryableHttpError, getStatus } from '../utils/errors';
import { isTemporaryId } from './queuePlanner';

/**
 * Motor de sincronización offline.
 *
 * - Una sola ejecución a la vez (single-flight): si ya hay una en curso, las
 *   llamadas siguientes reciben la misma promesa. Así un cambio nunca se envía
 *   dos veces aunque la sincronización se dispare desde varios sitios.
 * - Procesa la cola en orden. Al confirmarse un "crear", el ID temporal se
 *   sustituye por el real en la caché y en el resto de la cola.
 * - Errores de red, 401, 429 o 5xx: se detiene y reintenta más tarde.
 * - Otros 4xx (datos inválidos, entidad inexistente): el cambio se descarta
 *   para que no bloquee al resto de la cola.
 */

const MAX_ATTEMPTS = 5;
let inFlight = null;

const STOP = 'stop';
const DONE = 'done';
const DROPPED = 'dropped';

const getEntityIdFromResponse = (data) => data?.deck_id ?? data?.id ?? data?.deckId ?? null;

async function sendChange(userId, change) {
  const { entity, operation, entity_id: entityId, payload } = change;

  if (entity === 'deck') {
    if (operation === 'create') {
      const response = await client.post('/decks', { name: payload?.name, userId });
      const realId = getEntityIdFromResponse(response.data);
      if (realId !== null) await remapEntityId(userId, 'deck', entityId, realId);
      return;
    }
    if (operation === 'update') {
      await client.patch(`/decks/${entityId}`, { ...payload, userId });
      return;
    }
    if (operation === 'delete') {
      await client.delete(`/decks?deckId=${entityId}&userId=${userId}`);
      return;
    }
  }

  if (entity === 'flashcard') {
    if (operation === 'create') {
      if (isTemporaryId(payload?.deck_id)) {
        // El mazo nunca llegó a crearse en el servidor.
        const error = new Error('El mazo de esta tarjeta no se pudo sincronizar.');
        error.permanent = true;
        throw error;
      }
      const response = await client.post('/flashcards', {
        word: payload.word,
        translation: payload.translation,
        image_url: payload.image_url ?? null,
        user_id: Number(userId),
        deck_id: Number(payload.deck_id),
      });
      const realId = response.data?.id ?? null;
      if (realId !== null) await remapEntityId(userId, 'flashcard', entityId, realId);
      return;
    }
    if (operation === 'update') {
      await client.patch(`/flashcards/${entityId}`, { ...payload, user_id: Number(userId) });
      return;
    }
    if (operation === 'delete') {
      await client.delete(`/flashcards/${entityId}`, { data: { userId: Number(userId) } });
      return;
    }
  }

  const error = new Error(`Cambio offline no soportado: ${entity}/${operation}`);
  error.permanent = true;
  throw error;
}

/** Si un "crear" se descarta, se quita también la copia local temporal. */
async function discardChange(userId, change) {
  await removePendingChange(change.id);
  if (change.operation !== 'create') return;
  if (change.entity === 'deck') await removeLocalDeck(userId, change.entity_id);
  if (change.entity === 'flashcard') await removeLocalFlashcard(userId, change.entity_id);
}

async function processChange(userId, change) {
  // Una edición o borrado que aún apunta a un ID temporal ya no tiene sentido.
  if (change.operation !== 'create' && isTemporaryId(change.entity_id)) {
    await removePendingChange(change.id);
    return DROPPED;
  }

  try {
    await sendChange(userId, change);
    await removePendingChange(change.id);
    return DONE;
  } catch (error) {
    if (isNetworkError(error) && !error.permanent) return STOP;
    // Sesión caducada: no es culpa del cambio; se reintenta tras volver a iniciar sesión.
    if (getStatus(error) === 401) return STOP;

    // Borrar algo que ya no existe equivale a haberlo borrado.
    if (change.operation === 'delete' && getStatus(error) === 404) {
      await removePendingChange(change.id);
      return DONE;
    }

    if (!error.permanent && isRetryableHttpError(error)) {
      await recordPendingChangeFailure(change.id, error?.message);
      if ((change.attempts ?? 0) + 1 < MAX_ATTEMPTS) return STOP;
    }

    console.warn('Se descartó un cambio offline que el servidor rechazó:', change.entity, change.operation, error?.message);
    await discardChange(userId, change);
    return DROPPED;
  }
}

async function syncChanges(userId) {
  const changes = await getPendingChanges(userId);
  let synced = 0;
  let dropped = 0;

  for (const original of changes) {
    // Releer: un "crear" anterior pudo haber cambiado IDs de esta operación.
    const current = (await getPendingChanges(userId)).find((item) => item.id === original.id);
    if (!current) continue;

    const result = await processChange(userId, current);
    if (result === STOP) break;
    if (result === DONE) synced += 1;
    if (result === DROPPED) dropped += 1;
  }
  return { synced, dropped };
}

/**
 * Sincroniza todo lo pendiente (cambios de mazos/tarjetas y quizzes).
 * Es seguro llamarla tantas veces como se quiera.
 */
export const syncAll = (userId) => {
  if (!userId) return Promise.resolve({ synced: 0, dropped: 0, pending: 0 });
  if (inFlight) return inFlight;

  inFlight = (async () => {
    let pending = await countPendingWork(userId).catch(() => 0);
    if (pending === 0) {
      setSyncStatus({ state: 'idle', pending: 0 });
      return { synced: 0, dropped: 0, pending: 0 };
    }
    if (!getNetworkState().deviceOnline) {
      setSyncStatus({ state: 'pending', pending });
      return { synced: 0, dropped: 0, pending };
    }

    setSyncStatus({ state: 'syncing', pending });
    let synced = 0;
    let dropped = 0;
    try {
      const changes = await syncChanges(userId);
      const quizzes = await syncPendingQuizProgress(userId);
      synced = changes.synced + (quizzes.synced ?? 0);
      dropped = changes.dropped + (quizzes.dropped ?? 0);
    } catch (error) {
      console.warn('La sincronización offline falló:', error?.message ?? error);
    }

    pending = await countPendingWork(userId).catch(() => getSyncStatus().pending);
    setSyncStatus({
      state: pending > 0 ? 'pending' : synced > 0 ? 'synced' : 'idle',
      pending,
      lastSyncedAt: synced > 0 ? Date.now() : getSyncStatus().lastSyncedAt,
    });
    return { synced, dropped, pending };
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
};
