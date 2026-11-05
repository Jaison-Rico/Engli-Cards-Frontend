import client from './client';
import {
  queueQuizProgress,
  getPendingQuizProgress,
  removePendingQuizProgress,
} from './localDatabase';

/**
 * Envía el resultado de un quiz al backend.
 *
 * Si la API no está disponible (sin conexión o backend caído) el resultado se
 * guarda en la base local y se reintentará más tarde mediante
 * `syncPendingQuizProgress`.
 *
 * @returns {Promise<{ ok: boolean, offline: boolean, data?: any }>}
 */
export const submitQuizProgress = async (userId, progress) => {
  const payload = {
    userId: Number(userId),
    deckId: progress.deckId === null || progress.deckId === undefined ? null : Number(progress.deckId),
    totalQuestions: Number(progress.totalQuestions) || 0,
    correctAnswers: Number(progress.correctAnswers) || 0,
    timeSpentSeconds: Number(progress.timeSpentSeconds) || 0,
  };

  try {
    const response = await client.post('/progress/quiz-complete', payload);
    return { ok: true, offline: false, data: response.data };
  } catch (error) {
    // `error.response` existe cuando el backend respondió (error HTTP).
    // Sin respuesta significa que no hubo conexión: en ese caso encolamos.
    if (error.response) {
      return { ok: false, offline: false, error };
    }

    try {
      await queueQuizProgress(userId, payload);
    } catch (queueError) {
      console.warn('No se pudo encolar el progreso del quiz:', queueError);
      return { ok: false, offline: true, error };
    }

    return { ok: false, offline: true, error };
  }
};

/**
 * Reintenta enviar los resultados de quiz que quedaron pendientes offline.
 * Se ejecuta al volver la app al primer plano o al recuperar conexión.
 */
export const syncPendingQuizProgress = async (userId) => {
  if (!userId) return { synced: 0, pending: 0 };

  let pending = [];
  try {
    pending = await getPendingQuizProgress(userId);
  } catch (error) {
    console.warn('No se pudieron leer los quizzes pendientes:', error);
    return { synced: 0, pending: 0 };
  }

  if (pending.length === 0) return { synced: 0, pending: 0 };

  let synced = 0;
  for (const entry of pending) {
    try {
      await client.post('/progress/quiz-complete', {
        userId: Number(userId),
        deckId: entry.deckId === null || entry.deckId === undefined ? null : Number(entry.deckId),
        totalQuestions: entry.totalQuestions,
        correctAnswers: entry.correctAnswers,
        timeSpentSeconds: entry.timeSpentSeconds,
      });
      await removePendingQuizProgress(entry.id);
      synced += 1;
    } catch (error) {
      if (error.response) {
        // El backend respondió con un error: reintentar no va a ayudar.
        await removePendingQuizProgress(entry.id);
        continue;
      }
      // Sigue sin conexión: dejamos el resto pendientes.
      break;
    }
  }

  const stillPending = (await getPendingQuizProgress(userId).catch(() => pending)).length;
  return { synced, pending: stillPending };
};
