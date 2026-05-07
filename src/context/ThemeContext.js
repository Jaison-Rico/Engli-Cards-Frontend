import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getTheme } from '../styles/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light'); // default to light
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('app_theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeMode(storedTheme);
          Appearance.setColorScheme(storedTheme);
        } else {
          // If no theme is saved, enforce light mode
          setThemeMode('light');
          Appearance.setColorScheme('light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    Appearance.setColorScheme(newTheme);
    try {
      await SecureStore.setItemAsync('app_theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
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
