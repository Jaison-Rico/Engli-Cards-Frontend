import * as SQLite from 'expo-sqlite';
import { planQueueChange } from './queuePlanner';

/**
 * Persistencia local (SQLite) para el modo offline.
 *
 * Tablas:
 *  - decks:                 un registro por mazo (sin las flashcards).
 *  - flashcards:            tarjetas cacheadas, relacionadas con su mazo.
 *  - pending_changes:       cola de operaciones hechas sin conexión.
 *  - pending_quiz_progress: resultados de quiz pendientes de enviar.
 *  - cached_user_data:      copia de estadísticas, logros y sesiones.
 *
 * El esquema se versiona con `PRAGMA user_version`; cada migración se aplica
 * una sola vez y dentro de una transacción.
 */

const DATABASE_NAME = 'engli-cards.db';
let databasePromise;

const MIGRATIONS = [
  // v1: esquema original (se mantiene idéntico para instalaciones existentes).
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS decks (
        user_id TEXT NOT NULL,
        deck_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, deck_id)
      );
      CREATE TABLE IF NOT EXISTS pending_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pending_quiz_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        deck_id TEXT,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_spent_seconds INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cached_user_data (
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, kind)
      );
    `);
  },
  // v2: tabla de flashcards, metadatos de reintento en la cola e índices.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS flashcards (
        user_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        deck_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, card_id, deck_id)
      );
      CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards (user_id, deck_id);

      ALTER TABLE pending_changes ADD COLUMN entity TEXT NOT NULL DEFAULT 'deck';
      ALTER TABLE pending_changes ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE pending_changes ADD COLUMN last_error TEXT;
      CREATE INDEX IF NOT EXISTS idx_pending_changes_user ON pending_changes (user_id, id);
      CREATE INDEX IF NOT EXISTS idx_pending_quiz_user ON pending_quiz_progress (user_id, id);
    `);

    // Mover las flashcards que antes vivían dentro del JSON del mazo.
    const rows = await db.getAllAsync('SELECT user_id, deck_id, payload FROM decks');
    const now = Date.now();
    for (const row of rows) {
      const deck = safeParse(row.payload);
      if (!deck) continue;
      const cards = Array.isArray(deck.flashcards) ? deck.flashcards : [];
      for (const card of cards) {
        const cardId = getCardId(card);
        if (cardId === null) continue;
        await db.runAsync(
          `INSERT OR REPLACE INTO flashcards (user_id, card_id, deck_id, payload, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          row.user_id, cardId, row.deck_id, JSON.stringify(card), now,
        );
      }
      const { flashcards, ...rest } = deck;
      await db.runAsync(
        'UPDATE decks SET payload = ? WHERE user_id = ? AND deck_id = ?',
        JSON.stringify({ ...rest, cardCount: rest.cardCount ?? cards.length }),
        row.user_id, row.deck_id,
      );
    }
  },
];

const migrate = async (db) => {
  const { user_version: current = 0 } =
    (await db.getFirstAsync('PRAGMA user_version')) ?? {};
  for (let version = current; version < MIGRATIONS.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await MIGRATIONS[version](db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
};

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME)
      .then(async (db) => {
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await migrate(db);
        return db;
      })
      .catch((error) => {
        // Permite reintentar la apertura en la siguiente llamada.
        databasePromise = undefined;
        throw error;
      });
  }
  return databasePromise;
};

/**
 * Todas las escrituras pasan por este candado: expo-sqlite no admite dos
 * transacciones simultáneas sobre la misma conexión, y sin serializarlas una
 * sincronización y una edición del usuario podrían chocar ("database is locked"
 * o "cannot start a transaction within a transaction").
 */
let writeLock = Promise.resolve();

const transaction = (work) => {
  const run = writeLock.then(async () => {
    const db = await getDatabase();
    let result;
    await db.withTransactionAsync(async () => {
      result = await work(db);
    });
    return result;
  });
  writeLock = run.catch(() => {});
  return run;
};

const write = (sql, ...params) => transaction((tx) => tx.runAsync(sql, ...params));

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const userKey = (userId) => String(userId);

function safeParse(text) {
  if (text === null || text === undefined) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('No se pudo leer un registro local:', error);
    return null;
  }
}

function getCardId(card) {
  const id = card?.id ?? card?.user_flashcard_id ?? card?.deck_flashcards_id;
  return id === undefined || id === null ? null : String(id);
}

const stripFlashcards = (deck) => {
  const { flashcards, ...rest } = deck;
  return rest;
};

async function writeDeckRow(db, userId, deck, now) {
  await db.runAsync(
    `INSERT OR REPLACE INTO decks (user_id, deck_id, payload, updated_at)
     VALUES (?, ?, ?, ?)`,
    userKey(userId), String(deck.deck_id), JSON.stringify(stripFlashcards(deck)), now,
  );
}

/**
 * Reemplaza las tarjetas de un mazo con las del servidor, conservando las
 * tarjetas creadas offline (`offline-…`) y sin reinsertar las que el usuario
 * borró y aún no se han sincronizado.
 */
async function replaceDeckCards(db, userId, deckId, cards, now, pendingDeletes) {
  const deletes = pendingDeletes ?? (await getPendingDeletes(db, userId));
  await db.runAsync(
    "DELETE FROM flashcards WHERE user_id = ? AND deck_id = ? AND card_id NOT LIKE 'offline-%'",
    userKey(userId), String(deckId),
  );
  for (const card of cards) {
    const cardId = getCardId(card);
    if (cardId === null || deletes.cards.has(cardId)) continue;
    await db.runAsync(
      `INSERT OR REPLACE INTO flashcards (user_id, card_id, deck_id, payload, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      userKey(userId), cardId, String(deckId), JSON.stringify(card), now,
    );
  }
}

async function getPendingRows(db, userId) {
  const rows = await db.getAllAsync(
    'SELECT entity, operation, entity_id, payload FROM pending_changes WHERE user_id = ?',
    userKey(userId),
  );
  return rows.map((row) => ({ ...row, payload: safeParse(row.payload) }));
}

/** Entidades con un borrado pendiente: no deben reaparecer al refrescar. */
async function getPendingDeletes(db, userId) {
  const rows = await getPendingRows(db, userId);
  const result = { decks: new Set(), cards: new Set() };
  for (const row of rows) {
    if (row.operation !== 'delete') continue;
    (row.entity === 'deck' ? result.decks : result.cards).add(String(row.entity_id));
  }
  return result;
}

/** IDs de mazos con operaciones pendientes: no deben borrarse al reconciliar. */
async function getDeckIdsWithPendingChanges(db, userId) {
  const rows = await getPendingRows(db, userId);
  const ids = new Set();
  for (const row of rows) {
    if (row.entity === 'deck') ids.add(String(row.entity_id));
    if (row.payload?.deck_id !== undefined && row.payload?.deck_id !== null) ids.add(String(row.payload.deck_id));
  }
  return ids;
}

export const initializeLocalDatabase = async () => {
  await getDatabase();
};

/* ------------------------------------------------------------------ */
/* Mazos y flashcards                                                  */
/* ------------------------------------------------------------------ */

/**
 * Sustituye la caché local por la lista que devolvió el servidor.
 *
 * - Inserta/actualiza cada mazo y reemplaza sus flashcards (salvo los que el
 *   usuario borró offline y aún no se sincronizaron).
 * - Borra los mazos locales que ya no existen en el servidor, salvo los que
 *   tienen cambios offline pendientes (p. ej. mazos `offline-…`).
 * - `includeSystem = false` significa que la lista no trae mazos del sistema,
 *   así que esos no se tocan.
 */
export const replaceDecksFromServer = async (userId, decks, { includeSystem = false } = {}) => {
  const now = Date.now();
  await transaction(async (tx) => {
    const protectedIds = await getDeckIdsWithPendingChanges(tx, userId);
    const pendingDeletes = await getPendingDeletes(tx, userId);
    const serverIds = new Set();

    for (const deck of decks) {
      if (deck?.deck_id === undefined || deck?.deck_id === null) continue;
      const deckId = String(deck.deck_id);
      serverIds.add(deckId);
      if (pendingDeletes.decks.has(deckId)) continue;
      await writeDeckRow(tx, userId, deck, now);
      if (Array.isArray(deck.flashcards)) {
        await replaceDeckCards(tx, userId, deckId, deck.flashcards, now, pendingDeletes);
      }
    }

    const localRows = await tx.getAllAsync(
      'SELECT deck_id, payload FROM decks WHERE user_id = ?',
      userKey(userId),
    );
    for (const row of localRows) {
      const deckId = String(row.deck_id);
      if (serverIds.has(deckId) || protectedIds.has(deckId)) continue;
      const local = safeParse(row.payload);
      if (!includeSystem && local?.is_system) continue;
      await tx.runAsync('DELETE FROM decks WHERE user_id = ? AND deck_id = ?', userKey(userId), deckId);
      await tx.runAsync('DELETE FROM flashcards WHERE user_id = ? AND deck_id = ?', userKey(userId), deckId);
    }
  });
};

/** Devuelve los mazos locales con sus flashcards adjuntas. */
export const getLocalDecks = async (userId) => {
  const db = await getDatabase();
  const [deckRows, cardRows] = await Promise.all([
    db.getAllAsync(
      'SELECT payload FROM decks WHERE user_id = ? ORDER BY updated_at DESC',
      userKey(userId),
    ),
    db.getAllAsync(
      'SELECT deck_id, payload FROM flashcards WHERE user_id = ? ORDER BY updated_at ASC, rowid ASC',
      userKey(userId),
    ),
  ]);

  const cardsByDeck = new Map();
  for (const row of cardRows) {
    const card = safeParse(row.payload);
    if (!card) continue;
    const list = cardsByDeck.get(String(row.deck_id)) ?? [];
    list.push(card);
    cardsByDeck.set(String(row.deck_id), list);
  }

  return deckRows
    .map((row) => safeParse(row.payload))
    .filter(Boolean)
    .map((deck) => {
      const flashcards = cardsByDeck.get(String(deck.deck_id)) ?? [];
      return { ...deck, flashcards, cardCount: flashcards.length || deck.cardCount || 0 };
    });
};

export const getLocalDeck = async (userId, deckId) => {
  const decks = await getLocalDecks(userId);
  return decks.find((deck) => String(deck.deck_id) === String(deckId)) ?? null;
};

/** Guarda un mazo. Si trae `flashcards`, también reemplaza su lista de tarjetas. */
export const saveLocalDeck = async (userId, deck) => {
  if (deck?.deck_id === undefined || deck?.deck_id === null) return;
  const now = Date.now();
  await transaction(async (tx) => {
    await writeDeckRow(tx, userId, deck, now);
    if (Array.isArray(deck.flashcards)) {
      await replaceDeckCards(tx, userId, deck.deck_id, deck.flashcards, now);
    }
  });
};

export const saveLocalDeckFlashcards = async (userId, deckId, cards) => {
  const now = Date.now();
  await transaction(async (tx) => {
    await replaceDeckCards(tx, userId, deckId, cards, now);
  });
};

export const getLocalDeckFlashcards = async (userId, deckId) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT payload FROM flashcards WHERE user_id = ? AND deck_id = ? ORDER BY updated_at ASC, rowid ASC',
    userKey(userId), String(deckId),
  );
  return rows.map((row) => safeParse(row.payload)).filter(Boolean);
};

export const removeLocalDeck = async (userId, deckId) => {
  await transaction(async (tx) => {
    await tx.runAsync('DELETE FROM decks WHERE user_id = ? AND deck_id = ?', userKey(userId), String(deckId));
    await tx.runAsync('DELETE FROM flashcards WHERE user_id = ? AND deck_id = ?', userKey(userId), String(deckId));
  });
};

/** Inserta o actualiza una flashcard dentro de un mazo. */
export const upsertLocalFlashcard = async (userId, deckId, card) => {
  const cardId = getCardId(card);
  if (cardId === null) return;
  await write(
    `INSERT OR REPLACE INTO flashcards (user_id, card_id, deck_id, payload, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    userKey(userId), cardId, String(deckId), JSON.stringify(card), Date.now(),
  );
};

/** Actualiza una flashcard en todos los mazos donde aparezca. */
export const updateLocalFlashcard = async (userId, cardId, changes) => {
  await transaction(async (tx) => {
    const rows = await tx.getAllAsync(
      'SELECT deck_id, payload FROM flashcards WHERE user_id = ? AND card_id = ?',
      userKey(userId), String(cardId),
    );
    for (const row of rows) {
      const card = safeParse(row.payload) ?? {};
      await tx.runAsync(
        'UPDATE flashcards SET payload = ? WHERE user_id = ? AND card_id = ? AND deck_id = ?',
        JSON.stringify({ ...card, ...changes }), userKey(userId), String(cardId), row.deck_id,
      );
    }
  });
};

export const removeLocalFlashcard = async (userId, cardId) => {
  await write(
    'DELETE FROM flashcards WHERE user_id = ? AND card_id = ?',
    userKey(userId), String(cardId),
  );
};

/**
 * Sustituye un ID temporal (`offline-…`) por el ID real del servidor en la
 * caché y en las operaciones pendientes que lo referencian.
 */
export const remapEntityId = async (userId, entity, temporaryId, realId) => {
  const from = String(temporaryId);
  const to = String(realId);
  if (from === to) return;

  await transaction(async (tx) => {
    if (entity === 'deck') {
      const row = await tx.getFirstAsync(
        'SELECT payload FROM decks WHERE user_id = ? AND deck_id = ?',
        userKey(userId), from,
      );
      if (row) {
        const deck = safeParse(row.payload) ?? {};
        await tx.runAsync('DELETE FROM decks WHERE user_id = ? AND deck_id = ?', userKey(userId), from);
        await writeDeckRow(tx, userId, { ...deck, deck_id: realId }, Date.now());
      }
      await tx.runAsync(
        'UPDATE OR REPLACE flashcards SET deck_id = ? WHERE user_id = ? AND deck_id = ?',
        to, userKey(userId), from,
      );
    } else {
      const rows = await tx.getAllAsync(
        'SELECT deck_id, payload FROM flashcards WHERE user_id = ? AND card_id = ?',
        userKey(userId), from,
      );
      for (const row of rows) {
        const card = safeParse(row.payload) ?? {};
        await tx.runAsync(
          'DELETE FROM flashcards WHERE user_id = ? AND card_id = ? AND deck_id = ?',
          userKey(userId), from, row.deck_id,
        );
        await tx.runAsync(
          `INSERT OR REPLACE INTO flashcards (user_id, card_id, deck_id, payload, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          userKey(userId), to, row.deck_id, JSON.stringify({ ...card, id: realId, pending: false }), Date.now(),
        );
      }
    }

    // Operaciones pendientes que apuntan al ID temporal.
    const pending = await tx.getAllAsync(
      'SELECT id, entity, entity_id, payload FROM pending_changes WHERE user_id = ?',
      userKey(userId),
    );
    for (const change of pending) {
      let nextEntityId = change.entity_id;
      let payload = safeParse(change.payload);
      let touched = false;
      if (change.entity === entity && String(change.entity_id) === from) {
        nextEntityId = to;
        touched = true;
      }
      if (entity === 'deck' && payload && String(payload.deck_id) === from) {
        payload = { ...payload, deck_id: to };
        touched = true;
      }
      if (touched) {
        await tx.runAsync(
          'UPDATE pending_changes SET entity_id = ?, payload = ? WHERE id = ?',
          nextEntityId, payload ? JSON.stringify(payload) : null, change.id,
        );
      }
    }
  });
};

/* ------------------------------------------------------------------ */
/* Cola de cambios pendientes                                          */
/* ------------------------------------------------------------------ */

const mapChangeRow = (row) => ({
  id: row.id,
  entity: row.entity ?? 'deck',
  operation: row.operation,
  entity_id: row.entity_id,
  payload: safeParse(row.payload),
  attempts: row.attempts ?? 0,
});

/**
 * Encola una operación compactando la cola: crear+editar se funde en un solo
 * "crear", crear+borrar se cancela, varias ediciones se quedan en la última.
 */
export const queueChange = async (userId, { entity = 'deck', operation, entityId, payload = null }) => {
  await transaction(async (tx) => {
    const existingRows = await tx.getAllAsync(
      `SELECT id, entity, operation, entity_id, payload, attempts FROM pending_changes
       WHERE user_id = ? AND entity = ? AND entity_id = ? ORDER BY id ASC`,
      userKey(userId), entity, String(entityId),
    );
    const plan = planQueueChange(existingRows.map(mapChangeRow), { entity, operation, entityId, payload });

    for (const id of plan.remove) {
      await tx.runAsync('DELETE FROM pending_changes WHERE id = ?', id);
    }
    for (const { id, payload: nextPayload } of plan.update) {
      await tx.runAsync(
        'UPDATE pending_changes SET payload = ? WHERE id = ?',
        nextPayload ? JSON.stringify(nextPayload) : null, id,
      );
    }
    if (plan.insert) {
      await tx.runAsync(
        `INSERT INTO pending_changes (user_id, entity, operation, entity_id, payload, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        userKey(userId), entity, operation, String(entityId),
        payload ? JSON.stringify(payload) : null, Date.now(),
      );
    }
    // Si se canceló la creación de un mazo, sus flashcards pendientes sobran.
    if (plan.cancelledCreate && entity === 'deck') {
      const cardChanges = await tx.getAllAsync(
        "SELECT id, payload FROM pending_changes WHERE user_id = ? AND entity = 'flashcard'",
        userKey(userId),
      );
      for (const change of cardChanges) {
        if (String(safeParse(change.payload)?.deck_id) === String(entityId)) {
          await tx.runAsync('DELETE FROM pending_changes WHERE id = ?', change.id);
        }
      }
    }
  });
};

export const getPendingChanges = async (userId) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, entity, operation, entity_id, payload, attempts
     FROM pending_changes WHERE user_id = ? ORDER BY id ASC`,
    userKey(userId),
  );
  return rows.map(mapChangeRow);
};

export const removePendingChange = async (id) => {
  await write('DELETE FROM pending_changes WHERE id = ?', id);
};

export const recordPendingChangeFailure = async (id, message) => {
  await write(
    'UPDATE pending_changes SET attempts = attempts + 1, last_error = ? WHERE id = ?',
    message ? String(message).slice(0, 500) : null, id,
  );
};

export const countPendingWork = async (userId) => {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT
       (SELECT COUNT(*) FROM pending_changes WHERE user_id = ?) +
       (SELECT COUNT(*) FROM pending_quiz_progress WHERE user_id = ?) AS total`,
    userKey(userId), userKey(userId),
  );
  return row?.total ?? 0;
};

/* ------------------------------------------------------------------ */
/* Progreso de quiz pendiente                                          */
/* ------------------------------------------------------------------ */

/**
 * Guarda el resultado de un quiz pendiente de enviar al backend.
 * Se usa cuando el dispositivo no tiene conexión con la API.
 */
export const queueQuizProgress = async (userId, progress) => {
  await write(
    `INSERT INTO pending_quiz_progress
       (user_id, deck_id, total_questions, correct_answers, time_spent_seconds, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    userKey(userId),
    progress.deckId === null || progress.deckId === undefined ? null : String(progress.deckId),
    Number(progress.totalQuestions) || 0,
    Number(progress.correctAnswers) || 0,
    Number(progress.timeSpentSeconds) || 0,
    Date.now(),
  );
};

export const getPendingQuizProgress = async (userId) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, deck_id, total_questions, correct_answers, time_spent_seconds
     FROM pending_quiz_progress WHERE user_id = ? ORDER BY id ASC`,
    userKey(userId),
  );
  return rows.map((row) => ({
    id: row.id,
    deckId: row.deck_id,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    timeSpentSeconds: row.time_spent_seconds,
  }));
};

export const removePendingQuizProgress = async (id) => {
  await write('DELETE FROM pending_quiz_progress WHERE id = ?', id);
};

/* ------------------------------------------------------------------ */
/* Caché de datos del usuario                                          */
/* ------------------------------------------------------------------ */

/**
 * Guarda una copia local de datos del usuario (estadísticas, logros, sesiones)
 * para poder mostrarlos cuando la API no está disponible.
 */
export const saveCachedUserData = async (userId, kind, data) => {
  await write(
    `INSERT OR REPLACE INTO cached_user_data (user_id, kind, payload, updated_at)
     VALUES (?, ?, ?, ?)`,
    userKey(userId), kind, JSON.stringify(data ?? null), Date.now(),
  );
};

export const getCachedUserData = async (userId, kind) => {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    'SELECT payload, updated_at FROM cached_user_data WHERE user_id = ? AND kind = ?',
    userKey(userId), kind,
  );
  if (!row) return null;
  const data = safeParse(row.payload);
  return data === null && row.payload !== 'null' ? null : { data, updatedAt: row.updated_at };
};
