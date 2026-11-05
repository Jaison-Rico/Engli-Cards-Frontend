const decks = new Map();
const pendingChanges = [];
const pendingQuizProgress = [];
let nextChangeId = 1;
let nextQuizProgressId = 1;

const key = (userId, deckId) => `${String(userId)}:${String(deckId)}`;

export const initializeLocalDatabase = async () => {};

export const saveDecksLocally = async (userId, values) => {
  values.forEach((deck) => {
    if (deck?.deck_id !== undefined && deck?.deck_id !== null) {
      decks.set(key(userId, deck.deck_id), deck);
    }
  });
};

export const getLocalDecks = async (userId) =>
  Array.from(decks.entries())
    .filter(([deckKey]) => deckKey.startsWith(`${String(userId)}:`))
    .map(([, deck]) => deck);

export const saveLocalDeck = async (userId, deck) => {
  if (deck?.deck_id) await saveDecksLocally(userId, [deck]);
};

export const removeLocalDeck = async (userId, deckId) => {
  decks.delete(key(userId, deckId));
};

export const queueChange = async (userId, operation, entityId, payload = null) => {
  pendingChanges.push({
    id: nextChangeId++,
    user_id: String(userId),
    operation,
    entity_id: String(entityId),
    payload,
  });
};

export const getPendingChanges = async (userId) =>
  pendingChanges.filter((change) => change.user_id === String(userId));

export const removePendingChange = async (id) => {
  const index = pendingChanges.findIndex((change) => change.id === id);
  if (index >= 0) pendingChanges.splice(index, 1);
};

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
  const index = pendingQuizProgress.findIndex((entry) => entry.id === id);
  if (index >= 0) pendingQuizProgress.splice(index, 1);
};
