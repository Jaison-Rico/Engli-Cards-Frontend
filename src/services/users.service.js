import client from './client';
import { saveCachedUserData, getCachedUserData } from './localDatabase';

const CACHE_KIND = {
  stats: 'stats',
  achievements: 'achievements',
  sessions: 'sessions',
};

/**
 * Ejecuta la petición y, si tiene éxito, guarda una copia local.
 * Si la API no responde (sin conexión / backend caído) devuelve la copia local
 * marcada con `offline: true` para que la UI pueda avisar al usuario.
 */
const fetchWithCache = async (userId, kind, request) => {
  try {
    const data = await request();
    await saveCachedUserData(userId, kind, data).catch(() => {});
    return { data, offline: false };
  } catch (error) {
    if (error.response) throw error;

    const cached = await getCachedUserData(userId, kind).catch(() => null);
    if (cached) {
      return { data: cached.data, offline: true, updatedAt: cached.updatedAt };
    }
    throw error;
  }
};

export const getUserStats = async (userId) => {
  const { data, offline, updatedAt } = await fetchWithCache(userId, CACHE_KIND.stats, () =>
    client.get(`/users/${userId}/stats`).then((r) => r.data)
  );
  return { data, offline, updatedAt };
};

export const getQuizSessions = async (userId, days = 7) => {
  const { data, offline, updatedAt } = await fetchWithCache(userId, CACHE_KIND.sessions, () =>
    client.get(`/users/${userId}/quiz-sessions?days=${days}`).then((r) => r.data)
  );
  return { data, offline, updatedAt };
};

export const getUserAchievements = async (userId) => {
  const { data, offline, updatedAt } = await fetchWithCache(userId, CACHE_KIND.achievements, () =>
    client.get(`/users/${userId}/achievements`).then((r) => r.data)
  );
  return { data, offline, updatedAt };
};

export const updateUserName = (userId, name) =>
  client.patch(`/users/${userId}`, { name }).then((r) => r.data);

export const uploadProfileImage = (userId, asset) => {
  const formData = new FormData();
  const uri = asset.uri;
  const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
  const mime =
    asset.mimeType ||
    (ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg');
  formData.append('avatar', { uri, name: asset.fileName || `avatar.${ext}`, type: mime });
  formData.append('userId', String(userId));
  return client
    .post('/cloudinary/upload-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteUser = (userId) =>
  client.delete(`/users/${userId}`).then((r) => r.data);
