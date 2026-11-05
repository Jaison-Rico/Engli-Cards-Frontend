import client from './client';
import { normalizeDeck } from '../utils/deck';
import { isNetworkError } from '../utils/errors';
import {
  getLocalDecks,
  getLocalDeck,
  replaceDecksFromServer,
  saveLocalDeck,
  saveLocalDeckFlashcards,
  getLocalDeckFlashcards,
  removeLocalDeck,
  queueChange,
} from './localDatabase';
import { syncAll } from './sync.service';
import { refreshPendingCount } from './syncStatus';
import { getNetworkState } from './networkStatus';
import { createTemporaryId, isTemporaryId } from './queuePlanner';

/**
 * Antes de una escritura online se vacía la cola, para que los cambios hechos
 * offline lleguen al servidor en el orden en que el usuario los hizo.
 */
const flushQueue = (userId) => syncAll(userId).catch(() => null);

const queueDeckChange = async (userId, operation, entityId, payload) => {
  await queueChange(userId, { entity: 'deck', operation, entityId, payload });
  await refreshPendingCount(userId);
};

/**
 * Lista de mazos del usuario.
 *
 * Online: sincroniza lo pendiente, descarga la lista, reconcilia la caché y
 * devuelve la lista del servidor más los mazos locales aún no sincronizados.
 * Offline: devuelve la caché marcada con `isOffline = true`.
 */
export const getDecks = async (userId, includeSystem = false) => {
  try {
    if (getNetworkState().deviceOnline) await flushQueue(userId);
    const res = await client.get(`/decks/${userId}?includeSystem=${includeSystem}`);
    const data = Array.isArray(res.data) ? res.data : (res.data?.decks ?? []);
    const serverDecks = data.map(normalizeDeck).filter((deck) => deck.deck_id !== null);
    await replaceDecksFromServer(userId, serverDecks, { includeSystem });

    const serverIds = new Set(serverDecks.map((deck) => String(deck.deck_id)));
    const localOnly = (await getLocalDecks(userId)).filter(
      (deck) => !serverIds.has(String(deck.deck_id)) && (includeSystem || !deck.is_system),
    );
    return [...serverDecks, ...localOnly];
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const cachedDecks = (await getLocalDecks(userId)).filter((deck) => includeSystem || !deck.is_system);
    if (cachedDecks.length > 0) {
      cachedDecks.isOffline = true;
      return cachedDecks;
    }
    throw error;
  }
};

/** @returns {Promise<object>} el mazo creado (con `pending: true` si quedó en cola). */
export const createDeck = async (name, userId) => {
  const createOffline = async () => {
    const temporaryDeck = normalizeDeck({
      deck_id: createTemporaryId(),
      deck_name: name,
      cardCount: 0,
      flashcards: [],
      is_system: false,
    });
    const deck = { ...temporaryDeck, pending: true };
    await saveLocalDeck(userId, deck);
    await queueDeckChange(userId, 'create', deck.deck_id, { name });
    return deck;
  };

  if (!getNetworkState().deviceOnline) return createOffline();
  try {
    await flushQueue(userId);
    const response = await client.post('/decks', { name, userId });
    const deck = normalizeDeck({ deck_name: name, cardCount: 0, flashcards: [], ...response.data });
    await saveLocalDeck(userId, deck);
    return deck;
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return createOffline();
  }
};

/** @returns {Promise<{ deck: object, offline: boolean }>} */
export const updateDeck = async (deckId, name, userId) => {
  const updateOffline = async () => {
    const current = await getLocalDeck(userId, deckId);
    const updated = normalizeDeck({ ...current, deck_id: deckId, deck_name: name });
    await saveLocalDeck(userId, { ...updated, flashcards: undefined });
    await queueDeckChange(userId, 'update', deckId, { name });
    return { deck: updated, offline: true };
  };

  if (isTemporaryId(deckId) || !getNetworkState().deviceOnline) return updateOffline();
  try {
    await flushQueue(userId);
    const response = await client.patch(`/decks/${deckId}`, { name, userId });
    const current = await getLocalDeck(userId, deckId);
    const deck = normalizeDeck({ ...current, ...response.data, deck_id: deckId, deck_name: name });
    await saveLocalDeck(userId, { ...deck, flashcards: undefined });
    return { deck, offline: false };
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return updateOffline();
  }
};

/** @returns {Promise<{ offline: boolean }>} */
export const deleteDeck = async (deckId, userId) => {
  const deleteOffline = async () => {
    await removeLocalDeck(userId, deckId);
    await queueDeckChange(userId, 'delete', deckId);
    return { offline: true };
  };

  if (isTemporaryId(deckId) || !getNetworkState().deviceOnline) return deleteOffline();
  try {
    await flushQueue(userId);
    await client.delete(`/decks?deckId=${deckId}&userId=${userId}`);
    await removeLocalDeck(userId, deckId);
    return { offline: false };
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return deleteOffline();
  }
};

/** Tarjetas de un mazo, con respaldo en la caché local si no hay conexión. */
export const getDeckFlashcards = async (deckId, userId) => {
  if (isTemporaryId(deckId)) return userId ? getLocalDeckFlashcards(userId, deckId) : [];
  try {
    const response = await client.get(`/decks/${deckId}/flashcards`);
    const cards = Array.isArray(response.data) ? response.data : [];
    if (!userId) return cards;
    await saveLocalDeckFlashcards(userId, deckId, cards);
    // Devuelve también las tarjetas creadas offline que aún no se enviaron.
    return getLocalDeckFlashcards(userId, deckId);
  } catch (error) {
    if (!userId || !isNetworkError(error)) throw error;
    return getLocalDeckFlashcards(userId, deckId);
  }
};

export const getDeckQuiz = (deckId) =>
  client.get(`/decks/${deckId}/quiz`).then((r) => r.data);

/** Compatibilidad: antes la sincronización vivía aquí. */
export const syncPendingChanges = (userId) => syncAll(userId);
