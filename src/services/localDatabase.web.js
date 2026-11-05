const decks = new Map();
const pendingChanges = [];
let nextChangeId = 1;

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
