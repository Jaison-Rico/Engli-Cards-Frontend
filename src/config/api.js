const dev = {
  BASE_URL: "https://c80ec44c7d90.ngrok-free.app"
};

const prod = {
  BASE_URL: "https://miapi-production.render.com"
};

export const config = __DEV__ ? dev : prod;

// __DEV__ es una variable global de React Native que es true en modo desarrollo
