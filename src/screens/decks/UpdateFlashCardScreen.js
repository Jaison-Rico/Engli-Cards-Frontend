import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Type, Globe, ImagePlus, CheckCircle2, RefreshCw, WifiOff } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useNetwork } from '../../context/NetworkContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import {
  updateFlashcard,
  deleteFlashcard,
  uploadFlashcardImage,
  isLocalImageUri,
} from '../../services/flashcards.service';
import { getErrorMessage, isNetworkError } from '../../utils/errors';
import { pickImageFromLibrary } from '../../utils/imagePicker';
import CachedImage from '../../components/CachedImage';
import ScreenHeader from '../../components/ui/ScreenHeader';
import FormField from '../../components/ui/FormField';
import PressableScale from '../../components/ui/PressableScale';
import IconButton from '../../components/ui/IconButton';

export default function UpdateFlashCard() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = getUserId(user);
  const { isOnline } = useNetwork();
  const feedback = useFeedback();
  const { toast, confirm } = feedback;
  const { card } = route.params;

  const [englishWord, setEnglishWord] = useState(card.word || '');
  const [spanishTranslation, setSpanishTranslation] = useState(card.translation || '');
  const [image, setImage] = useState(card.image_url || null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const pickImage = async () => {
    const asset = await pickImageFromLibrary(feedback);
    if (asset) setImage(asset.uri);
  };

  /** URL final de la imagen, o `undefined` si el usuario decide esperar. */
  const resolveImageUrl = async () => {
    if (!image || !isLocalImageUri(image)) return image || null;

    const askKeepPrevious = () => confirm({
      title: 'Sin conexión para subir la imagen',
      message: 'Puedes guardar los cambios de texto ahora y conservar la imagen anterior.',
      confirmText: 'Guardar sin cambiar imagen',
      cancelText: 'Esperar',
      icon: WifiOff,
    }).then((ok) => (ok ? card.image_url || null : undefined));

    if (!isOnline) return askKeepPrevious();
    try {
      return await uploadFlashcardImage(image);
    } catch (err) {
      if (isNetworkError(err)) return askKeepPrevious();
      throw err;
    }
  };

  const handleUpdate = async () => {
    const errors = {};
    if (!englishWord.trim()) errors.word = 'Escribe la palabra en inglés.';
    if (!spanishTranslation.trim()) errors.translation = 'Escribe la traducción.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || saving) return;

    setSaving(true);
    try {
      const imageUrl = await resolveImageUrl();
      if (imageUrl === undefined) return;
      const { offline } = await updateFlashcard(userId, card.id, {
        word: englishWord.trim(),
        translation: spanishTranslation.trim(),
        imageUrl,
      });
      navigation.goBack();
      if (offline) toast.offline('Cambios guardados en el dispositivo', { message: 'Se sincronizarán al volver la conexión.' });
      else toast.success('Tarjeta actualizada');
    } catch (err) {
      toast.error('No se pudo actualizar la tarjeta', { message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: '¿Eliminar esta tarjeta?',
      message: `“${card.word}” se quitará de tus mazos. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      destructive: true,
      icon: Trash2,
    });
    if (!ok) return;
    try {
      const { offline } = await deleteFlashcard(userId, card.id);
      navigation.goBack();
      if (offline) toast.offline('Tarjeta eliminada en el dispositivo', { message: 'Se eliminará del servidor al volver la conexión.' });
      else toast.success('Tarjeta eliminada');
    } catch (err) {
      toast.error('No se pudo eliminar la tarjeta', { message: getErrorMessage(err) });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Editar flashcard"
        onBack={() => navigation.goBack()}
        right={(
          <IconButton accessibilityLabel="Eliminar tarjeta" onPress={handleDelete}>
            <Trash2 color={theme.colors.danger} size={20} />
          </IconButton>
        )}
      />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PressableScale
            onPress={pickImage}
            scaleTo={0.99}
            accessibilityLabel={image ? 'Cambiar imagen' : 'Añadir imagen'}
            className="mb-6 h-48 items-center justify-center overflow-hidden rounded-3xl border border-border bg-default"
          >
            {image ? (
              <>
                <CachedImage uri={image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <View className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-overlay px-3 py-1.5">
                  <RefreshCw size={13} color={theme.colors.primary} />
                  <Typography type="body-xs" weight="semibold" className="text-accent">Cambiar imagen</Typography>
                </View>
              </>
            ) : (
              <View className="items-center gap-2">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <ImagePlus color={theme.colors.primary} size={22} />
                </View>
                <Typography type="body-sm" weight="semibold">Añadir imagen</Typography>
              </View>
            )}
          </PressableScale>

          <FormField
            label="Palabra en inglés"
            icon={Type}
            value={englishWord}
            onChangeText={(text) => { setEnglishWord(text); setFieldErrors((p) => ({ ...p, word: null })); }}
            autoCapitalize="none"
            error={fieldErrors.word}
          />
          <FormField
            label="Traducción en español"
            icon={Globe}
            value={spanishTranslation}
            onChangeText={(text) => { setSpanishTranslation(text); setFieldErrors((p) => ({ ...p, translation: null })); }}
            error={fieldErrors.translation}
          />

          <Button size="lg" className="mt-4 w-full" onPress={handleUpdate} isDisabled={saving}>
            {saving ? <Spinner color={theme.colors.onPrimary} size="sm" /> : (
              <>
                <CheckCircle2 color={theme.colors.onPrimary} size={18} />
                <Button.Label>Guardar cambios</Button.Label>
              </>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
