import client from './client';

/** Lecciones del sistema (mazos `is_system`) ordenadas por `order_index`. */
export const getSystemLessons = async () => {
  const { data } = await client.get('/decks/all');
  return (Array.isArray(data) ? data : [])
    .filter((deck) => deck.is_system)
    .sort((a, b) => a.order_index - b.order_index);
};

export const saveSystemLesson = (userId, { deckId, name, orderIndex, minAccuracy }) => {
  const body = {
    name,
    user_id: Number(userId),
    is_system: true,
    order_index: orderIndex,
    min_accuracy: minAccuracy,
  };
  const request = deckId ? client.patch(`/decks/${deckId}`, body) : client.post('/decks', body);
  return request.then((r) => r.data);
};

export const deleteSystemLesson = (userId, deckId) =>
  client.delete(`/decks?deckId=${deckId}&userId=${userId}`).then((r) => r.data);
