import client from './client';
import { saveCachedUserData, getCachedUserData } from './localDatabase';
import { resolveStreak } from './learning.service';

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
  if (!data) return { data, offline, updatedAt };
  let serverData = data;
  // Sin conexión, el caché puede tener una racha vieja: si se guardó hace 2+
  // días, el usuario no ha jugado desde entonces y la racha está rota.
  if (offline && updatedAt) {
    const cachedDay = new Date(updatedAt); cachedDay.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if ((today - cachedDay) / 86400000 >= 2) serverData = { ...data, streak_current: 0 };
  }
  // Se combina con la racha local (SQLite): cubre quizzes offline sin sincronizar.
  const streak = await resolveStreak(userId, serverData);
  return {
    data: { ...serverData, streak_current: streak, streak_best: Math.max(serverData.streak_best ?? 0, streak) },
    offline,
    updatedAt,
  };
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
