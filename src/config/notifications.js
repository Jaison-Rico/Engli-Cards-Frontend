import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  } catch (error) {
    console.log('Notificaciones no disponibles en este entorno:', error?.message);
  }
}

export async function scheduleDailyStudyReminder() {
  try {
    await registerForPushNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📖 ¡Es hora de practicar! 🚀",
        body: 'Mantén tu racha activa y aprende 5 palabras nuevas hoy.',
        data: { data: 'goes here' },
        ...(Platform.OS === 'android' && { channelId: 'default' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10, // 10 AM
        minute: 0,
      },
    });
  } catch (error) {
    console.log('No se pudo programar el recordatorio diario:', error?.message);
  }
}
