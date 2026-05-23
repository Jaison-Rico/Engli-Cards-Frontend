import axios from 'axios';
import { config } from '../config/api';

let _token = null;

export const setAuthToken = (token) => { _token = token; };
export const clearAuthToken = () => { _token = null; };

const client = axios.create({ baseURL: config.BASE_URL });

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

export default client;
