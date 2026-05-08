import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { registerForPushNotificationsAsync, scheduleDailyStudyReminder } from './src/config/notifications';

export default function App() {
  useEffect(() => {
    // registerForPushNotificationsAsync(); // Comentado para evitar error en Expo Go SDK 53+
    scheduleDailyStudyReminder();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


