import './global.css';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProvider } from 'heroui-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { scheduleDailyStudyReminder } from './src/config/notifications';
import { useAuth, getUserId } from './src/context/AuthContext';
import { syncPendingChanges } from './src/services/decks.service';

function OfflineSyncManager() {
  const { user } = useAuth();
  const userId = getUserId(user);

  useEffect(() => {
    if (!userId) return undefined;

    const sync = () => {
      syncPendingChanges(userId).catch((error) => {
        console.warn('No se pudieron sincronizar los cambios offline:', error);
      });
    };

    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, [userId]);

  return null;
}

export default function App() {
  useEffect(() => {
    scheduleDailyStudyReminder();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <OfflineSyncManager />
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
