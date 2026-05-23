export const normalizeDeck = (d) => ({
  deck_id: d.deck_id ?? d.id ?? d._id ?? d.deckId ?? String(Math.random()),
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
});
