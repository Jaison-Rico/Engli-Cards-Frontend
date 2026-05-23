import client from './client';
import { normalizeDeck } from '../utils/deck';

export const getDecks = async (userId, includeSystem = false) => {
  const res = await client.get(`/decks/${userId}?includeSystem=${includeSystem}`);
  const data = Array.isArray(res.data) ? res.data : (res.data?.decks ?? []);
  return data.map(normalizeDeck);
};

export const createDeck = (name, userId) =>
  client.post('/decks', { name, userId }).then((r) => r.data);

export const updateDeck = (deckId, name, userId) =>
  client.patch(`/decks/${deckId}`, { name, userId }).then((r) => r.data);

export const deleteDeck = (deckId, userId) =>
  client.delete(`/decks?deckId=${deckId}&userId=${userId}`).then((r) => r.data);

export const getDeckFlashcards = (deckId) =>
  client.get(`/decks/${deckId}/flashcards`).then((r) => r.data);

export const getDeckQuiz = (deckId) =>
  client.get(`/decks/${deckId}/quiz`).then((r) => r.data);
