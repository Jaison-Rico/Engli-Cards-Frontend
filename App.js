import './global.css';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProvider } from 'heroui-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth, getUserId } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { FeedbackProvider } from './src/components/feedback/FeedbackProvider';
import ConnectionStrip from './src/components/feedback/ConnectionStrip';
import { enableStudyReminders } from './src/config/notifications';
import { warmUpVoices } from './src/services/tts';
import { ensureCurriculumSeeded } from './src/services/curriculum.service';

function StudyReminderManager() {
  const { user } = useAuth();
  const userId = getUserId(user);

  useEffect(() => {
    // El permiso de notificaciones se pide solo cuando ya hay una sesión
    // iniciada, para no interrumpir el primer arranque de la app.
    if (!userId) return undefined;
    // Precarga las voces es/en del TTS para que el primer "Escuchar" sea inmediato.
    warmUpVoices();
    // Siembra el plan de estudios en SQLite en segundo plano (idempotente).
    ensureCurriculumSeeded().catch((error) => console.warn('No se pudo sembrar el plan de estudios:', error));

    enableStudyReminders().catch((error) => {
      console.warn('No se pudieron activar los recordatorios de estudio:', error);
    });

    return undefined;
  }, [userId]);

  return null;
}

/**
 * Orden de proveedores:
 *  Theme → Auth → Network (conexión + sincronización offline) → Feedback
 *  (toasts, diálogos, hojas de acciones) → franja de conexión → navegación.
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <NetworkProvider>
                <FeedbackProvider>
                  <StudyReminderManager />
                  <ConnectionStrip>
                    <AppNavigator />
                  </ConnectionStrip>
                </FeedbackProvider>
              </NetworkProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
