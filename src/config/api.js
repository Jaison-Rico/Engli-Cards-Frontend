import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevBaseUrl = () => {
  // 1. Si hay una variable de entorno explícita, usarla
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Usar el hostUri de Expo que contiene la IP real del servidor de desarrollo
  //    Esto funciona en dispositivos físicos, simuladores y emuladores
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0]; // extraer solo la IP/hostname
    console.log('🚀 [API CONFIG] Expo hostUri detectado:', hostUri, '-> host:', host);
    return `http://${host}:3000`;
  }

  // 3. Fallback según la plataforma
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const dev = {
  BASE_URL: getDevBaseUrl()
};

const prod = {
  BASE_URL: "https://engli.cards.backend.oween.software"
};

export const config = __DEV__ ? dev : prod;

console.log('🚀 [API CONFIG] Platform:', Platform.OS);
console.log('🚀 [API CONFIG] __DEV__:', __DEV__);
console.log('🚀 [API CONFIG] Final BASE_URL:', config.BASE_URL);

// __DEV__ es una variable global de React Native que es true en modo desarrollo


/*
Ejemplo de usuario para pruebas:
{
  "name": "test",
  "email": "test@example.com",
  "password": "2210"
}
*/