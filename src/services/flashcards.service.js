import client, { UPLOAD_TIMEOUT_MS } from './client';
import { isNetworkError } from '../utils/errors';
import {
  queueChange,
  upsertLocalFlashcard,
  updateLocalFlashcard,
  removeLocalFlashcard,
} from './localDatabase';
import { syncAll } from './sync.service';
import { refreshPendingCount } from './syncStatus';
import { getNetworkState } from './networkStatus';
import { createTemporaryId, isTemporaryId } from './queuePlanner';

/** Las imágenes locales necesitan subirse a Cloudinary: requiere conexión. */
export const isLocalImageUri = (uri) => Boolean(uri) && !/^https?:\/\//i.test(uri);

const getImageMime = (uri) => {
  const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
  return { ext, mime: ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg' };
};

/** Sube una imagen local y devuelve su URL pública. */
export const uploadFlashcardImage = async (uri) => {
  const { ext, mime } = getImageMime(uri);
  const formData = new FormData();
  formData.append('image', { uri, name: `flashcard.${ext}`, type: mime });
  const response = await client.post('/cloudinary/upload-flashcard', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return response.data.imageUrl;
};

const queueCardChange = async (userId, operation, entityId, payload) => {
  await queueChange(userId, { entity: 'flashcard', operation, entityId, payload });
  await refreshPendingCount(userId);
};

const canGoOnline = (...ids) => getNetworkState().deviceOnline && !ids.some(isTemporaryId);

/**
 * Crea una flashcard. Sin conexión se guarda localmente y se sincroniza luego.
 * @returns {Promise<{ card: object, offline: boolean }>}
 */
export const createFlashcard = async (userId, { word, translation, imageUrl = null, deckId }) => {
  const payload = { word, translation, image_url: imageUrl, deck_id: String(deckId) };

  const createOffline = async () => {
    const card = { id: createTemporaryId(), word, translation, image_url: imageUrl, pending: true };
    await upsertLocalFlashcard(userId, deckId, card);
    await queueCardChange(userId, 'create', card.id, payload);
    return { card, offline: true };
  };

  if (!canGoOnline(deckId)) return createOffline();
  try {
    await syncAll(userId).catch(() => null);
    const response = await client.post('/flashcards', {
      word,
      translation,
      image_url: imageUrl,
      user_id: Number(userId),
      deck_id: Number(deckId),
    });
    const card = { word, translation, image_url: imageUrl, ...response.data };
    await upsertLocalFlashcard(userId, deckId, card);
    return { card, offline: false };
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return createOffline();
  }
};

/** @returns {Promise<{ offline: boolean }>} */
export const updateFlashcard = async (userId, cardId, { word, translation, imageUrl = null }) => {
  const changes = { word, translation, image_url: imageUrl };

  const updateOffline = async () => {
    await updateLocalFlashcard(userId, cardId, { ...changes, pending: true });
    await queueCardChange(userId, 'update', cardId, changes);
    return { offline: true };
  };

  if (!canGoOnline(cardId)) return updateOffline();
  try {
    await syncAll(userId).catch(() => null);
    await client.patch(`/flashcards/${cardId}`, { ...changes, user_id: Number(userId) });
    await updateLocalFlashcard(userId, cardId, changes);
    return { offline: false };
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return updateOffline();
  }
};

/** @returns {Promise<{ offline: boolean }>} */
export const deleteFlashcard = async (userId, cardId) => {
  const deleteOffline = async () => {
    await removeLocalFlashcard(userId, cardId);
    await queueCardChange(userId, 'delete', cardId);
    return { offline: true };
  };

  if (!canGoOnline(cardId)) return deleteOffline();
  try {
    await syncAll(userId).catch(() => null);
    await client.delete(`/flashcards/${cardId}`, { data: { userId: Number(userId) } });
    await removeLocalFlashcard(userId, cardId);
    return { offline: false };
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return deleteOffline();
  }
};
