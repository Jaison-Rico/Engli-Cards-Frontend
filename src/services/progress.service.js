import client from './client';
import {
  queueQuizProgress,
  getPendingQuizProgress,
  removePendingQuizProgress,
} from './localDatabase';
import { refreshPendingCount } from './syncStatus';
import { isNetworkError, isRetryableHttpError } from '../utils/errors';

const toPayload = (userId, progress) => ({
  userId: Number(userId),
  deckId: progress.deckId === null || progress.deckId === undefined ? null : Number(progress.deckId),
  totalQuestions: Number(progress.totalQuestions) || 0,
  correctAnswers: Number(progress.correctAnswers) || 0,
  timeSpentSeconds: Number(progress.timeSpentSeconds) || 0,
});

/**
 * Envía el resultado de un quiz al backend.
 *
 * Si la API no está disponible (sin conexión o backend caído) el resultado se
 * guarda en la base local y lo reenvía el motor de sincronización.
 *
 * @returns {Promise<{ ok: boolean, offline: boolean, data?: any }>}
 */
export const submitQuizProgress = async (userId, progress) => {
  const payload = toPayload(userId, progress);

  try {
    const response = await client.post('/progress/quiz-complete', payload);
    return { ok: true, offline: false, data: response.data };
  } catch (error) {
    if (!isNetworkError(error)) {
      return { ok: false, offline: false, error };
    }

    try {
      await queueQuizProgress(userId, payload);
      await refreshPendingCount(userId);
    } catch (queueError) {
      console.warn('No se pudo encolar el progreso del quiz:', queueError);
    }
    return { ok: false, offline: true, error };
  }
};

/**
 * Reenvía los resultados de quiz que quedaron pendientes offline.
 * Lo invoca `syncAll` (sync.service) dentro de su ejecución única.
 */
export const syncPendingQuizProgress = async (userId) => {
  if (!userId) return { synced: 0, dropped: 0 };

  let pending = [];
  try {
    pending = await getPendingQuizProgress(userId);
  } catch (error) {
    console.warn('No se pudieron leer los quizzes pendientes:', error);
    return { synced: 0, dropped: 0 };
  }

  let synced = 0;
  let dropped = 0;
  for (const entry of pending) {
    try {
      await client.post('/progress/quiz-complete', toPayload(userId, entry));
      await removePendingQuizProgress(entry.id);
      synced += 1;
    } catch (error) {
      // Sin conexión o error temporal del servidor: se reintenta más tarde.
      if (isNetworkError(error) || isRetryableHttpError(error)) break;
      // El backend rechazó el resultado (4xx): reintentar no va a ayudar.
      await removePendingQuizProgress(entry.id);
      dropped += 1;
    }
  }

  return { synced, dropped };
};
