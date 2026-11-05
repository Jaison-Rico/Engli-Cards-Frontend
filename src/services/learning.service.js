import {
  recordCardAnswer,
  getHardestCards as getHardestCardsLocal,
  markActivityDay,
  getActivityDays,
} from './localDatabase';
import { getDecks, getDeckFlashcards } from './decks.service';
import { PLAYABLE_LESSONS } from '../data/lessons';
import { detectLanguage } from './tts';

/**
 * Capa de aprendizaje local (SQLite):
 *  - normaliza tarjetas de cualquier origen a { key, deckId, front, back, image }
 *  - registra aciertos/errores por tarjeta (alimenta el modo Supervivencia)
 *  - lleva los días jugados para calcular la racha también sin conexión
 */

/* ------------------------------ Fechas ------------------------------ */

/** 'YYYY-MM-DD' en la zona horaria del dispositivo. */
export const localDay = (date = new Date()) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};

const dayIndex = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

/**
 * Racha a partir de una lista de días jugados (orden indiferente).
 * Regla estricta: si el último día jugado no es hoy ni ayer, la racha es 0.
 */
export const computeStreak = (days, today = localDay()) => {
  if (!days?.length) return 0;
  const set = new Set(days.map(dayIndex));
  const t = dayIndex(today);
  let cursor = set.has(t) ? t : set.has(t - 1) ? t - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (set.has(cursor)) { streak += 1; cursor -= 1; }
  return streak;
};

/* ----------------------------- Tarjetas ----------------------------- */

const clean = (s) => String(s ?? '').trim();

/**
 * Normaliza una tarjeta (lección local, flashcard de usuario o pregunta de
 * quiz) al formato común. `front` siempre es inglés y `back` español.
 * La clave depende solo del par de palabras: la misma tarjeta suma
 * estadísticas aunque venga de orígenes distintos.
 */
export const normalizeCard = (raw, deckId = null) => {
  let front = clean(raw.english ?? raw.word ?? raw.front);
  let back = clean(raw.spanish ?? raw.translation ?? raw.back);
  if (!front || !back) return null;
  const image = raw.image ?? raw.image_url ?? null;
  return {
    key: `${front.toLowerCase()}|${back.toLowerCase()}`,
    deckId: deckId === null || deckId === undefined ? null : String(deckId),
    front,
    back,
    image,
  };
};

/** Pregunta de quiz (pregunta + opción correcta) → tarjeta, detectando el idioma. */
export const cardFromQuizQuestion = (question, correctText, deckId = null) => {
  const q = clean(question);
  const a = clean(correctText);
  if (!q || !a) return null;
  const qIsSpanish = detectLanguage(q) === 'es' || detectLanguage(a) === 'en';
  return normalizeCard({ front: qIsSpanish ? a : q, back: qIsSpanish ? q : a }, deckId);
};

const dedupe = (cards) => {
  const seen = new Set();
  return cards.filter((c) => c && !seen.has(c.key) && seen.add(c.key));
};

export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Tarjetas para un minijuego.
 * @param {{type:'all'}|{type:'lesson',name:string}|{type:'deck',deckId:string}|{type:'cards',cards:Array}} source
 */
export const getCardPool = async (userId, source = { type: 'all' }) => {
  // Tarjetas ya normalizadas (nodos del mapa).
  if (source.type === 'cards') return dedupe(source.cards ?? []);
  if (source.type === 'lesson') {
    const lesson = PLAYABLE_LESSONS.find((l) => l.name === source.name);
    return dedupe((lesson?.cards ?? []).map((c) => normalizeCard(c, `lesson:${source.name}`)));
  }
  if (source.type === 'deck') {
    const cards = await getDeckFlashcards(source.deckId, userId).catch(() => []);
    return dedupe(cards.map((c) => normalizeCard(c, source.deckId)));
  }
  // 'all': lecciones + mazos personales (si hay conexión o caché).
  const lessonCards = PLAYABLE_LESSONS.flatMap((l) => l.cards.map((c) => normalizeCard(c, `lesson:${l.name}`)));
  let deckCards = [];
  try {
    const decks = (await getDecks(userId, false)).filter((d) => !d.is_system);
    const lists = await Promise.all(decks.map((d) => getDeckFlashcards(d.deck_id, userId).catch(() => [])));
    deckCards = lists.flatMap((cards, i) => cards.map((c) => normalizeCard(c, decks[i].deck_id)));
  } catch { /* sin mazos personales disponibles */ }
  return dedupe([...deckCards, ...lessonCards]);
};

/**
 * Tarjetas para Supervivencia: primero las de mayor tasa de error (SQLite);
 * si no hay suficientes, se completa con tarjetas al azar.
 * Con `source` (p. ej. el jefe de un módulo) solo se usan tarjetas de ese
 * origen, ordenadas igualmente por dificultad.
 */
export const getSurvivalDeck = async (userId, size = 30, source = null) => {
  if (source) {
    const pool = await getCardPool(userId, source);
    const allowed = new Map(pool.map((c) => [c.key, c]));
    const hardest = (await getHardestCardsLocal(userId, 500).catch(() => []))
      .filter((c) => allowed.has(c.key))
      .map((c) => allowed.get(c.key));
    const known = new Set(hardest.map((c) => c.key));
    const rest = shuffle(pool.filter((c) => !known.has(c.key)));
    return { cards: [...hardest, ...rest].slice(0, size), fromErrors: hardest.length };
  }
  const hardest = await getHardestCardsLocal(userId, size).catch(() => []);
  if (hardest.length >= size) return { cards: hardest, fromErrors: hardest.length };
  const pool = shuffle(await getCardPool(userId, { type: 'all' }));
  const known = new Set(hardest.map((c) => c.key));
  const filler = pool.filter((c) => !known.has(c.key)).slice(0, size - hardest.length);
  return { cards: [...hardest, ...filler], fromErrors: hardest.length };
};

/* ----------------------- Registro de actividad ---------------------- */

/** Registra una respuesta y marca el día como jugado. Nunca lanza. */
export const recordAnswer = async (userId, card, correct) => {
  if (!userId || !card) return;
  try {
    await recordCardAnswer(userId, card, correct);
    await markActivityDay(userId, localDay());
  } catch (e) {
    if (__DEV__) console.warn('No se pudo registrar la respuesta:', e?.message ?? e);
  }
};

/** Marca hoy como jugado (al terminar cualquier quiz o minijuego). */
export const markPlayedToday = (userId) =>
  (userId ? markActivityDay(userId, localDay()).catch(() => {}) : Promise.resolve());

/** Racha calculada solo con datos locales. */
export const getLocalStreak = async (userId) => {
  if (!userId) return 0;
  try {
    return computeStreak(await getActivityDays(userId));
  } catch {
    return 0;
  }
};

/**
 * Racha a mostrar combinando servidor y dispositivo. Ambas fuentes aplican la
 * regla estricta (sin actividad hoy ni ayer → 0), así que se toma la mayor:
 *  - el servidor puede ir por detrás si hay quizzes offline sin sincronizar;
 *  - el dispositivo no conoce los días jugados en otros dispositivos.
 */
export const resolveStreak = async (userId, serverStats) => {
  const local = await getLocalStreak(userId);
  const server = Number(serverStats?.streak_current ?? 0) || 0;
  return Math.max(server, local);
};
