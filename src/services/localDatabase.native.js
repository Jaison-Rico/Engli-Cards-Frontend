import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'engli-cards.db';
let databasePromise;

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
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
      `);
      return db;
    });
  }
  return databasePromise;
};

const userKey = (userId) => String(userId);

export const initializeLocalDatabase = async () => {
  await getDatabase();
};

const parsePayload = (row) => {
  try {
    return JSON.parse(row.payload);
  } catch (error) {
    console.warn('No se pudo leer un registro local:', error);
    return null;
  }
};

export const saveDecksLocally = async (userId, decks) => {
  const db = await getDatabase();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const deck of decks) {
      if (deck?.deck_id === undefined || deck?.deck_id === null) continue;
      await db.runAsync(
        `INSERT OR REPLACE INTO decks (user_id, deck_id, payload, updated_at)
         VALUES (?, ?, ?, ?)`,
        userKey(userId),
        String(deck.deck_id),
        JSON.stringify(deck),
        now,
      );
    }
  });
};

export const getLocalDecks = async (userId) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT payload FROM decks WHERE user_id = ? ORDER BY updated_at DESC',
    userKey(userId),
  );
  return rows.map(parsePayload).filter(Boolean);
};

export const saveLocalDeck = async (userId, deck) => {
  if (!deck?.deck_id) return;
  await saveDecksLocally(userId, [deck]);
};

export const removeLocalDeck = async (userId, deckId) => {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM decks WHERE user_id = ? AND deck_id = ?',
    userKey(userId),
    String(deckId),
  );
};

export const queueChange = async (userId, operation, entityId, payload = null) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO pending_changes (user_id, operation, entity_id, payload, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    userKey(userId),
    operation,
    String(entityId),
    payload ? JSON.stringify(payload) : null,
    Date.now(),
  );
};

export const getPendingChanges = async (userId) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT id, operation, entity_id, payload FROM pending_changes WHERE user_id = ? ORDER BY id ASC',
    userKey(userId),
  );
  return rows.map((row) => ({
    ...row,
    payload: row.payload ? JSON.parse(row.payload) : null,
  }));
};

export const removePendingChange = async (id) => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pending_changes WHERE id = ?', id);
};

/**
 * Guarda el resultado de un quiz pendiente de enviar al backend.
 * Se usa cuando el dispositivo no tiene conexión con la API.
 */
export const queueQuizProgress = async (userId, progress) => {
  const db = await getDatabase();
  await db.runAsync(
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
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pending_quiz_progress WHERE id = ?', id);
};
