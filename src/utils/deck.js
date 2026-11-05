/**
 * Normaliza la forma de un mazo venga de donde venga (API, caché o creado
 * offline). Si no trae ID devuelve `deck_id: null`: antes se inventaba un ID
 * aleatorio y cada recarga dejaba un registro basura en la caché local.
 */
export const normalizeDeck = (d = {}) => ({
  deck_id: d.deck_id ?? d.id ?? d._id ?? d.deckId ?? null,
  deck_name: d.deck_name ?? d.name ?? d.title ?? 'Deck',
  cardCount:
    d.cardCount ??
    d.cardsCount ??
    (Array.isArray(d.flashcards)
      ? d.flashcards.length
      : Array.isArray(d.cards)
      ? d.cards.length
      : 0),
  flashcards: d.flashcards,
  is_system: d.is_system ?? false,
  order_index: d.order_index ?? 0,
  is_locked: d.is_locked ?? false,
  best_accuracy: d.best_accuracy ?? 0,
  min_accuracy: d.min_accuracy ?? 0.9,
  ...(d.pending ? { pending: true } : {}),
});
