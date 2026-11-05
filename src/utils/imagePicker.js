import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageOff } from 'lucide-react-native';

/**
 * Abre la galería y devuelve el asset elegido (o null si se cancela).
 * Si el permiso está denegado muestra un diálogo propio con acceso a Ajustes,
 * en lugar del Alert nativo.
 *
 * @param {{ confirm: Function, toast: object }} feedback  resultado de useFeedback()
 */
export async function pickImageFromLibrary(feedback, options = {}) {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      const openSettings = await feedback.confirm({
        title: 'Permiso para tus fotos',
        message: 'Para elegir una imagen, permite que Engli-Cards acceda a tu galería desde los ajustes del teléfono.',
        confirmText: 'Abrir ajustes',
        cancelText: 'Ahora no',
        icon: ImageOff,
      });
      if (openSettings) Linking.openSettings().catch(() => {});
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: false,
      ...options,
    });
    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0];
  } catch {
    feedback.toast.error('No pudimos abrir tu galería', { message: 'Intenta nuevamente.' });
    return null;
  }
}
