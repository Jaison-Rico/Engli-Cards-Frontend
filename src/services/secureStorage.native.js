/**
 * Almacenamiento seguro en nativo (iOS/Android).
 *
 * `expo-secure-store` no tiene implementación en web: su módulo nativo se
 * resuelve a un objeto vacío y `getItemAsync` revienta con
 * "getValueWithKeyAsync is not a function". Por eso la app usa esta capa
 * intermedia con una variante propia para web (`secureStorage.web.js`).
 *
 * En nativo se delega en `expo-secure-store`, que guarda la sesión y el tema
 * en el keychain / keystore.
 *
 * Importante: ninguna de estas funciones rechaza. Si el almacén falla (por
 * ejemplo, porque la clave del keystore se invalidó tras reinstalar la app o
 * cambiar la firma), se devuelve `null` en vez de propagar el error. La app
 * depende de estos valores solo para preferencias: un fallo no debe impedir
 * que la aplicación arranque.
 */
import * as SecureStore from 'expo-secure-store';

export const getItemAsync = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`[secureStorage] No se pudo leer "${key}":`, error?.message ?? error);
    return null;
  }
};

export const setItemAsync = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(`[secureStorage] No se pudo guardar "${key}":`, error?.message ?? error);
  }
};

export const deleteItemAsync = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[secureStorage] No se pudo borrar "${key}":`, error?.message ?? error);
  }
};
