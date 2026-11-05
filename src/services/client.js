import axios from 'axios';
import { config } from '../config/api';
import { setServerReachable } from './networkStatus';
import { isNetworkError } from '../utils/errors';

let _token = null;

export const setAuthToken = (token) => { _token = token; };
export const clearAuthToken = () => { _token = null; };

// Sin timeout una petición con mala señal puede quedarse colgada indefinidamente.
export const DEFAULT_TIMEOUT_MS = 15000;
export const UPLOAD_TIMEOUT_MS = 30000;

const client = axios.create({ baseURL: config.BASE_URL, timeout: DEFAULT_TIMEOUT_MS });

client.interceptors.request.use((req) => {
  if (_token) {
    if (req.headers && typeof req.headers.set === 'function') {
      req.headers.set('Authorization', `Bearer ${_token}`);
    } else {
      req.headers = req.headers || {};
      req.headers['Authorization'] = `Bearer ${_token}`;
    }
  }
  return req;
});

// Cada respuesta (o su ausencia) actualiza el indicador global de conexión.
client.interceptors.response.use(
  (response) => {
    setServerReachable(true);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    setServerReachable(!isNetworkError(error));
    return Promise.reject(error);
  },
);

export default client;
