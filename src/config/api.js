import { NativeModules, Platform } from 'react-native';

const fallbackDevUrl = 'http://10.0.2.2:3000';

const getDevBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return fallbackDevUrl;
  }

  const host = scriptURL.split('://')[1]?.split(':')[0];

  if (!host) {
    return fallbackDevUrl;
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    return Platform.OS === 'android' ? fallbackDevUrl : 'http://localhost:3000';
  }

  return `http://${host}:3000`;
};

const dev = {
  BASE_URL: getDevBaseUrl()
};

const prod = {
  BASE_URL: "https://engli-cards-backend-production.up.railway.app"
};

export const config = __DEV__ ? dev : prod;

// __DEV__ es una variable global de React Native que es true en modo desarrollo


/*
Ejemplo de usuario para pruebas:
{
  "name": "test",
  "email": "test@example.com",
  "password": "2210"
}


*/