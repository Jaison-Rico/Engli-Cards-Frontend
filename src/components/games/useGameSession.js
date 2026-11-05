import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, getUserId } from '../../context/AuthContext';
import { submitQuizProgress } from '../../services/progress.service';
import { getCardPool, markPlayedToday, recordAnswer } from '../../services/learning.service';
import { completeNode } from '../../services/curriculum.service';

/**
 * Lógica común de los minijuegos:
 *  - carga las tarjetas (`loader` recibe userId y devuelve un array)
 *  - registra cada respuesta en SQLite (recordAnswer)
 *  - al terminar marca el día jugado y envía el resultado al backend
 *    (si no hay conexión queda en la cola offline, como los quizzes)
 *  - si se juega desde un nodo del mapa (`node`), guarda su progreso local
 */
export default function useGameSession(loader, { node = null } = {}) {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { correct, total, savedOffline, achievement, passed }
  const startedAt = useRef(Date.now());
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const list = await loaderRef.current(userId);
      setCards(list);
      startedAt.current = Date.now();
    } catch (e) {
      setError(e?.message ?? 'No se pudieron cargar las tarjetas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const answer = useCallback((card, correct) => recordAnswer(userId, card, correct), [userId]);

  const finish = useCallback(async (correct, total) => {
    let savedOffline = false;
    let achievement = null;
    let passed = null;
    try {
      if (node) passed = await completeNode(userId, node.id, node.type, total > 0 ? correct / total : 0);
      await markPlayedToday(userId);
      if (userId && total > 0) {
        const res = await submitQuizProgress(userId, {
          deckId: null,
          totalQuestions: total,
          correctAnswers: correct,
          timeSpentSeconds: Math.floor((Date.now() - startedAt.current) / 1000),
        });
        savedOffline = Boolean(res.offline);
        achievement = res.ok ? res.data?.unlockedAchievements?.[0] ?? null : null;
      }
    } catch (e) {
      if (__DEV__) console.warn('No se pudo guardar el minijuego:', e?.message ?? e);
    }
    setResult({ correct, total, savedOffline, achievement, passed });
  }, [userId, node]);

  return { userId, cards, loading, error, result, reload: load, answer, finish };
}

/** Loader estándar: tarjetas del origen elegido, barajadas y limitadas. */
export const poolLoader = (source, limit, shuffleFn) => async (userId) => {
  const pool = await getCardPool(userId, source ?? { type: 'all' });
  return shuffleFn(pool).slice(0, limit);
};

/** Mensaje extra cuando se juega desde un nodo del mapa. */
export const nodeResultNote = (passed) =>
  passed === true ? ' ¡Nodo superado: se desbloqueó el siguiente!' : passed === false ? ' Necesitas 70% de aciertos para superar este nodo.' : '';
