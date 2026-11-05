import client from './client';
import { normalizeDeck } from '../utils/deck';
import {
  getLocalDecks,
  saveDecksLocally,
  saveLocalDeck,
  removeLocalDeck,
  queueChange,
  getPendingChanges,
  removePendingChange,
} from './localDatabase';

export const getDecks = async (userId, includeSystem = false) => {
  try {
    const res = await client.get(`/decks/${userId}?includeSystem=${includeSystem}`);
    const data = Array.isArray(res.data) ? res.data : (res.data?.decks ?? []);
    const decks = data.map(normalizeDeck);
    await saveDecksLocally(userId, decks);
    await syncPendingChanges(userId);
    return decks;
  } catch (error) {
    if (error.response) throw error;
    const cachedDecks = await getLocalDecks(userId);
    if (cachedDecks.length > 0) {
      cachedDecks.isOffline = true;
      return cachedDecks;
    }
    throw error;
  }
};

export const createDeck = async (name, userId) => {
  try {
    const response = await client.post('/decks', { name, userId });
    const deck = normalizeDeck(response.data);
    await saveLocalDeck(userId, deck);
    return deck;
  } catch (error) {
    if (error.response) throw error;
    const temporaryDeck = normalizeDeck({
      deck_id: `offline-${Date.now()}`,
      deck_name: name,
      cardCount: 0,
      is_system: false,
    });
    await saveLocalDeck(userId, temporaryDeck);
    await queueChange(userId, 'create', temporaryDeck.deck_id, { name });
    return temporaryDeck;
  }
};

export const updateDeck = async (deckId, name, userId) => {
  try {
    const response = await client.patch(`/decks/${deckId}`, { name, userId });
    const deck = normalizeDeck(response.data);
    await saveLocalDeck(userId, deck);
    return deck;
  } catch (error) {
    if (error.response) throw error;
    const decks = await getLocalDecks(userId);
    const current = decks.find((item) => String(item.deck_id) === String(deckId));
    const updated = normalizeDeck({ ...current, deck_id: deckId, deck_name: name });
    await saveLocalDeck(userId, updated);
    await queueChange(userId, 'update', deckId, { name });
    return updated;
  }
};

export const deleteDeck = async (deckId, userId) => {
  try {
    const response = await client.delete(`/decks?deckId=${deckId}&userId=${userId}`);
    await removeLocalDeck(userId, deckId);
    return response.data;
  } catch (error) {
    if (error.response) throw error;
    await removeLocalDeck(userId, deckId);
    await queueChange(userId, 'delete', deckId);
    return { offline: true };
  }
};

export const getDeckFlashcards = async (deckId, userId) => {
  try {
    const response = await client.get(`/decks/${deckId}/flashcards`);
    const cards = Array.isArray(response.data) ? response.data : [];
    if (userId) {
      const decks = await getLocalDecks(userId);
      const deck = decks.find((item) => String(item.deck_id) === String(deckId));
      if (deck) await saveLocalDeck(userId, { ...deck, flashcards: cards, cardCount: cards.length });
    }
    return cards;
  } catch (error) {
    const decks = userId ? await getLocalDecks(userId) : [];
    const cachedCards = decks.find((item) => String(item.deck_id) === String(deckId))?.flashcards;
    if (cachedCards) return cachedCards;
    throw error;
  }
};

export const getDeckQuiz = (deckId) =>
  client.get(`/decks/${deckId}/quiz`).then((r) => r.data);

export const syncPendingChanges = async (userId) => {
  const changes = await getPendingChanges(userId);
  for (const change of changes) {
    try {
      if (change.operation === 'create') {
        await client.post('/decks', { ...change.payload, userId });
      } else if (change.operation === 'update') {
        await client.patch(`/decks/${change.entity_id}`, { ...change.payload, userId });
      } else if (change.operation === 'delete') {
        await client.delete(`/decks?deckId=${change.entity_id}&userId=${userId}`);
      }
      await removePendingChange(change.id);
    } catch (error) {
      break;
    }
  }
};
