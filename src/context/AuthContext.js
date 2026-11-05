import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken, clearAuthToken } from '../services/client';
import { initializeLocalDatabase } from '../services/localDatabase';

export const getUserId = (user) =>
  user?.user_id ?? user?._id ?? user?.id ?? user?.userId ?? null;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync('token'),
          SecureStore.getItemAsync('userInfo'),
        ]);
        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
        }
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.warn('No se pudo restaurar la sesión guardada:', error);
      }
      finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    initializeLocalDatabase().catch((error) => {
      console.warn('No se pudo inicializar la base de datos local:', error);
    });
  }, []);

  const login = async (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    await SecureStore.setItemAsync('token', newToken);
    await SecureStore.setItemAsync('userInfo', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    clearAuthToken();
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userInfo');
  };

  const updateUser = async (partial) => {
    const next = { ...user, ...partial };
    setUser(next);
    await SecureStore.setItemAsync('userInfo', JSON.stringify(next));
  };

  if (!isLoaded) return null;

  return (
    <AuthContext.Provider value={{ user, token, isLoaded, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
