/**
 * Implementación en memoria para web. Expone la misma API que
 * `localDatabase.native.js` para que los servicios no dependan de la plataforma.
 */
import { planQueueChange } from './queuePlanner';

const decks = new Map(); // `${userId}:${deckId}` -> deck (sin flashcards)
const flashcards = new Map(); // `${userId}:${deckId}` -> Map(cardId -> card)
let pendingChanges = [];
let pendingQuizProgress = [];
const cachedUserData = new Map();
let nextChangeId = 1;
let nextQuizProgressId = 1;

const key = (userId, deckId) => `${String(userId)}:${String(deckId)}`;
const belongsTo = (userId) => (entryKey) => entryKey.startsWith(`${String(userId)}:`);
const getCardId = (card) => {
  const id = card?.id ?? card?.user_flashcard_id ?? card?.deck_flashcards_id;
  return id === undefined || id === null ? null : String(id);
};
const stripFlashcards = ({ flashcards: _ignored, ...rest }) => rest;

const pendingDeletes = (userId, entity) =>
  new Set(
    pendingChanges
      .filter((c) => c.user_id === String(userId) && c.entity === entity && c.operation === 'delete')
      .map((c) => String(c.entity_id)),
  );

/** Igual que en SQLite: conserva tarjetas `offline-…` y no revive borradas. */
const setDeckCards = (userId, deckId, cards) => {
  const previous = flashcards.get(key(userId, deckId)) ?? new Map();
  const deleted = pendingDeletes(userId, 'flashcard');
  const map = new Map();
  previous.forEach((card, id) => {
    if (id.startsWith('offline-')) map.set(id, card);
  });
  cards.forEach((card) => {
    const id = getCardId(card);
    if (id !== null && !deleted.has(id)) map.set(id, card);
  });
  flashcards.set(key(userId, deckId), map);
};

export const initializeLocalDatabase = async () => {};

export const replaceDecksFromServer = async (userId, values, { includeSystem = false } = {}) => {
  const protectedIds = new Set();
  pendingChanges
    .filter((change) => change.user_id === String(userId))
    .forEach((change) => {
      if (change.entity === 'deck') protectedIds.add(String(change.entity_id));
      if (change.payload?.deck_id !== undefined) protectedIds.add(String(change.payload.deck_id));
    });

  const serverIds = new Set();
  const deletedDecks = pendingDeletes(userId, 'deck');
  values.forEach((deck) => {
    if (deck?.deck_id === undefined || deck?.deck_id === null) return;
    serverIds.add(String(deck.deck_id));
    if (deletedDecks.has(String(deck.deck_id))) return;
    decks.set(key(userId, deck.deck_id), stripFlashcards(deck));
    if (Array.isArray(deck.flashcards)) setDeckCards(userId, deck.deck_id, deck.flashcards);
  });

  Array.from(decks.entries())
    .filter(([entryKey]) => belongsTo(userId)(entryKey))
    .forEach(([entryKey, deck]) => {
      const deckId = String(deck.deck_id);
      if (serverIds.has(deckId) || protectedIds.has(deckId)) return;
      if (!includeSystem && deck.is_system) return;
      decks.delete(entryKey);
      flashcards.delete(entryKey);
    });
};

export const getLocalDecks = async (userId) =>
  Array.from(decks.entries())
    .filter(([entryKey]) => belongsTo(userId)(entryKey))
    .map(([entryKey, deck]) => {
      const cards = Array.from(flashcards.get(entryKey)?.values() ?? []);
      return { ...deck, flashcards: cards, cardCount: cards.length || deck.cardCount || 0 };
    });

export const getLocalDeck = async (userId, deckId) =>
  (await getLocalDecks(userId)).find((deck) => String(deck.deck_id) === String(deckId)) ?? null;

export const saveLocalDeck = async (userId, deck) => {
  if (deck?.deck_id === undefined || deck?.deck_id === null) return;
  decks.set(key(userId, deck.deck_id), stripFlashcards(deck));
  if (Array.isArray(deck.flashcards)) setDeckCards(userId, deck.deck_id, deck.flashcards);
};

export const saveLocalDeckFlashcards = async (userId, deckId, cards) => {
  setDeckCards(userId, deckId, cards);
};

export const getLocalDeckFlashcards = async (userId, deckId) =>
  Array.from(flashcards.get(key(userId, deckId))?.values() ?? []);

export const removeLocalDeck = async (userId, deckId) => {
  decks.delete(key(userId, deckId));
  flashcards.delete(key(userId, deckId));
};

export const upsertLocalFlashcard = async (userId, deckId, card) => {
  const id = getCardId(card);
  if (id === null) return;
  const entryKey = key(userId, deckId);
  if (!flashcards.has(entryKey)) flashcards.set(entryKey, new Map());
  flashcards.get(entryKey).set(id, card);
};

export const updateLocalFlashcard = async (userId, cardId, changes) => {
  flashcards.forEach((map, entryKey) => {
    if (!belongsTo(userId)(entryKey) || !map.has(String(cardId))) return;
    map.set(String(cardId), { ...map.get(String(cardId)), ...changes });
  });
};

export const removeLocalFlashcard = async (userId, cardId) => {
  flashcards.forEach((map, entryKey) => {
    if (belongsTo(userId)(entryKey)) map.delete(String(cardId));
  });
};

export const remapEntityId = async (userId, entity, temporaryId, realId) => {
  const from = String(temporaryId);
  const to = String(realId);
  if (from === to) return;

  if (entity === 'deck') {
    const deck = decks.get(key(userId, from));
    if (deck) {
      decks.delete(key(userId, from));
      decks.set(key(userId, to), { ...deck, deck_id: realId });
    }
    const cards = flashcards.get(key(userId, from));
    if (cards) {
      flashcards.delete(key(userId, from));
      flashcards.set(key(userId, to), cards);
    }
  } else {
    flashcards.forEach((map, entryKey) => {
      if (!belongsTo(userId)(entryKey) || !map.has(from)) return;
      const card = map.get(from);
      map.delete(from);
      map.set(to, { ...card, id: realId, pending: false });
    });
  }

  pendingChanges = pendingChanges.map((change) => {
    if (change.user_id !== String(userId)) return change;
    let next = change;
    if (change.entity === entity && String(change.entity_id) === from) next = { ...next, entity_id: to };
    if (entity === 'deck' && String(change.payload?.deck_id) === from) {
      next = { ...next, payload: { ...next.payload, deck_id: to } };
    }
    return next;
  });
};

export const queueChange = async (userId, { entity = 'deck', operation, entityId, payload = null }) => {
  const existing = pendingChanges.filter(
    (change) =>
      change.user_id === String(userId) &&
      change.entity === entity &&
      String(change.entity_id) === String(entityId),
  );
  const plan = planQueueChange(existing, { entity, operation, entityId, payload });

  pendingChanges = pendingChanges
    .filter((change) => !plan.remove.includes(change.id))
    .map((change) => {
      const update = plan.update.find((item) => item.id === change.id);
      return update ? { ...change, payload: update.payload } : change;
    });

  if (plan.insert) {
    pendingChanges.push({
      id: nextChangeId++,
      user_id: String(userId),
      entity,
      operation,
      entity_id: String(entityId),
      payload,
      attempts: 0,
    });
  }

  if (plan.cancelledCreate && entity === 'deck') {
    pendingChanges = pendingChanges.filter(
      (change) => !(change.entity === 'flashcard' && String(change.payload?.deck_id) === String(entityId)),
    );
  }
};

export const getPendingChanges = async (userId) =>
  pendingChanges.filter((change) => change.user_id === String(userId));

export const removePendingChange = async (id) => {
  pendingChanges = pendingChanges.filter((change) => change.id !== id);
};

export const recordPendingChangeFailure = async (id) => {
  pendingChanges = pendingChanges.map((change) =>
    change.id === id ? { ...change, attempts: (change.attempts ?? 0) + 1 } : change,
  );
};

export const countPendingWork = async (userId) =>
  pendingChanges.filter((change) => change.user_id === String(userId)).length +
  pendingQuizProgress.filter((entry) => entry.user_id === String(userId)).length;

export const queueQuizProgress = async (userId, progress) => {
  pendingQuizProgress.push({
    id: nextQuizProgressId++,
    user_id: String(userId),
    deckId: progress.deckId === null || progress.deckId === undefined ? null : String(progress.deckId),
    totalQuestions: Number(progress.totalQuestions) || 0,
    correctAnswers: Number(progress.correctAnswers) || 0,
    timeSpentSeconds: Number(progress.timeSpentSeconds) || 0,
  });
};

export const getPendingQuizProgress = async (userId) =>
  pendingQuizProgress.filter((entry) => entry.user_id === String(userId));

export const removePendingQuizProgress = async (id) => {
  pendingQuizProgress = pendingQuizProgress.filter((entry) => entry.id !== id);
};

export const saveCachedUserData = async (userId, kind, data) => {
  cachedUserData.set(`${String(userId)}:${kind}`, { data, updatedAt: Date.now() });
};

export const getCachedUserData = async (userId, kind) =>
  cachedUserData.get(`${String(userId)}:${kind}`) ?? null;
