import './global.css';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProvider } from 'heroui-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { enableStudyReminders } from './src/config/notifications';
import { useAuth, getUserId } from './src/context/AuthContext';
import { syncPendingChanges } from './src/services/decks.service';
import { syncPendingQuizProgress } from './src/services/progress.service';

function OfflineSyncManager() {
  const { user } = useAuth();
  const userId = getUserId(user);

  useEffect(() => {
    if (!userId) return undefined;

    const sync = () => {
      syncPendingChanges(userId).catch((error) => {
        console.warn('No se pudieron sincronizar los cambios offline:', error);
      });
      syncPendingQuizProgress(userId).catch((error) => {
        console.warn('No se pudieron sincronizar los quizzes pendientes:', error);
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

function StudyReminderManager() {
  const { user } = useAuth();
  const userId = getUserId(user);

  useEffect(() => {
    // El permiso de notificaciones se pide solo cuando ya hay una sesión
    // iniciada, para no interrumpir el primer arranque de la app.
    if (!userId) return undefined;

    enableStudyReminders().catch((error) => {
      console.warn('No se pudieron activar los recordatorios de estudio:', error);
    });

    return undefined;
  }, [userId]);

  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <OfflineSyncManager />
              <StudyReminderManager />
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
