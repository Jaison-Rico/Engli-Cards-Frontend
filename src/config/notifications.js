import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'default';
const REMINDER_HOUR = 10;
const REMINDER_MINUTE = 0;

const LOG_PREFIX = '[notifications]';

/**
 * Expo Go (SDK 53+) no incluye el módulo nativo completo de canales de
 * notificación en Android. Llamar a `setNotificationChannelAsync` ahí lanza
 * un NullPointerException nativo que no se puede recuperar desde JS.
 *
 * https://docs.expo.dev/versions/latest/sdk/notifications/
 */
export function isExpoGo() {
  return Constants.executionEnvironment === Constants.ExecutionEnvironment?.Expo;
}

/**
 * Los canales y la programación de notificaciones solo funcionan de forma
 * fiable en builds propias (development build o release build).
 */
export function areNotificationsSupported() {
  if (Platform.OS === 'web') return false;
  if (isExpoGo()) return false;
  return true;
}

function logWarning(message, error) {
  console.warn(`${LOG_PREFIX} ${message}`, error?.message ?? error ?? '');
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Recordatorios de estudio',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  } catch (error) {
    logWarning('No se pudo crear el canal de notificaciones de Android.', error);
  }
}

async function hasNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    logWarning('No se pudo consultar el permiso de notificaciones.', error);
    return false;
  }
}

/**
 * Solicita el permiso de notificaciones. Solo debe llamarse una vez que el
 * usuario ya inició sesión, para no interrumpir el primer arranque.
 *
 * @returns {Promise<boolean>} `true` si el permiso quedó concedido.
 */
export async function requestNotificationPermission() {
  if (!areNotificationsSupported()) {
    return false;
  }

  try {
    // En Android 13+ el diálogo del sistema solo aparece si ya existe un canal.
    await ensureAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    logWarning('No se pudo solicitar el permiso de notificaciones.', error);
    return false;
  }
}

/**
 * Programa el recordatorio diario de estudio.
 *
 * @returns {Promise<boolean>} `true` si el recordatorio quedó programado.
 */
export async function scheduleDailyStudyReminder() {
  if (!areNotificationsSupported()) {
    return false;
  }

  try {
    await ensureAndroidChannel();

    if (!(await hasNotificationPermission())) {
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 ¡Es hora de practicar! 🚀',
        body: 'Mantén tu racha activa y aprende 5 palabras nuevas hoy.',
        data: { type: 'daily-study-reminder' },
        ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    });

    return true;
  } catch (error) {
    logWarning('No se pudo programar el recordatorio diario.', error);
    return false;
  }
}

/**
 * Solicita el permiso (si hace falta) y deja el recordatorio diario activo.
 * Se invoca una vez que el usuario inicia sesión.
 */
export async function enableStudyReminders() {
  if (!areNotificationsSupported()) {
    return false;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  return scheduleDailyStudyReminder();
}
