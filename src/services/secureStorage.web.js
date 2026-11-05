/**
 * Almacenamiento seguro en web.
 *
 * `expo-secure-store` no funciona en web (su módulo nativo es un stub vacío),
 * así que aquí se usa `localStorage`, que es el equivalente natural del
 * navegador: persistente entre recargas y con la misma API asíncrona.
 *
 * Misma API que `secureStorage.native.js` para que el resto de la app no
 * dependa de la plataforma.
 */

const PREFIX = 'engli-cards:';

/** localStorage puede lanzar en modo privado o con cookies bloqueadas. */
const safeStorage = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  };
};

export const getItemAsync = async (key) => {
  const store = safeStorage();
  if (!store) return null;
  try {
    return store.getItem(PREFIX + key);
  } catch {
    return null;
  }
};

export const setItemAsync = async (key, value) => {
  const store = safeStorage();
  if (!store) return;
  try {
    store.setItem(PREFIX + key, String(value));
  } catch {
    // Sin espacio o en modo privado: se ignora en vez de romper el flujo.
  }
};

export const deleteItemAsync = async (key) => {
  const store = safeStorage();
  if (!store) return;
  try {
    store.removeItem(PREFIX + key);
  } catch {
    // idem
  }
};
