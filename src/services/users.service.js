import client from './client';

export const getUserStats = (userId) =>
  client.get(`/users/${userId}/stats`).then((r) => r.data);

export const getQuizSessions = (userId, days = 7) =>
  client.get(`/users/${userId}/quiz-sessions?days=${days}`).then((r) => r.data);

export const getUserAchievements = (userId) =>
  client.get(`/users/${userId}/achievements`).then((r) => r.data);

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
