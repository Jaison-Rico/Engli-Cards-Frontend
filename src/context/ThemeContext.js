import React, { createContext, useContext, useState, useEffect } from 'react';
import { Uniwind } from 'uniwind';
import * as SecureStore from '../services/secureStorage';
import { getTheme } from '../theme/theme';

export const ThemeContext = createContext();

/**
 * Aplica el modo de color.
 *
 * `Uniwind.setTheme` es la vía correcta y multiplataforma: en nativo actualiza
 * las clases de uniwind y llama a `Appearance.setColorScheme` por dentro; en
 * web cambia la clase `light`/`dark` del `<html>` (react-native-web no
 * implementa `Appearance.setColorScheme`).
 */
const applyColorScheme = (scheme) => {
  try {
    Uniwind.setTheme(scheme);
  } catch (error) {
    console.warn('No se pudo aplicar el tema:', error?.message ?? error);
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light'); // default to light
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // El tema nunca debe bloquear el arranque: si el almacenamiento falla o
    // tarda, la app se muestra igual con el tema por defecto. Antes, un fallo
    // aquí dejaba la pantalla en negro para siempre.
    let cancelled = false;

    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('app_theme');
        if (cancelled) return;
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeMode(storedTheme);
          applyColorScheme(storedTheme);
        } else {
          // If no theme is saved, enforce light mode
          setThemeMode('light');
          applyColorScheme('light');
        }
      } catch (error) {
        console.warn('No se pudo leer el tema guardado:', error?.message ?? error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadTheme();
    return () => { cancelled = true; };
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    applyColorScheme(newTheme);
    try {
      await SecureStore.setItemAsync('app_theme', newTheme);
    } catch (error) {
      console.warn('No se pudo guardar el tema:', error?.message ?? error);
    }
  };

  if (!isLoaded) return null; // Avoid rendering until theme is loaded

  const theme = getTheme(themeMode);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
