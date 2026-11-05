/**
 * Helpers para clasificar errores de axios de forma consistente.
 */

/** No hubo respuesta del servidor: sin conexión, timeout o backend caído. */
export const isNetworkError = (error) => Boolean(error) && !error.response;

export const getStatus = (error) => error?.response?.status ?? null;

/** Errores del servidor que tiene sentido reintentar más tarde. */
export const isRetryableHttpError = (error) => {
  const status = getStatus(error);
  return status === 401 || status === 408 || status === 429 || (status !== null && status >= 500);
};

/** Mensaje legible para el usuario a partir de un error de API. */
export const getErrorMessage = (error, fallback = 'Ocurrió un error inesperado. Intenta de nuevo.') => {
  if (isNetworkError(error)) return 'No hay conexión con el servidor. Revisa tu Internet e intenta de nuevo.';
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
};
