const dev = {
  BASE_URL: "https://engli-cards-backend-production.up.railway.app"
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