import React, { useCallback, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Save, ChevronDown, Type, Globe, Lightbulb, ImagePlus, Layers, Link2, WifiOff, X } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useNetwork } from '../../context/NetworkContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import { getDecks } from '../../services/decks.service';
import { createFlashcard, uploadFlashcardImage, isLocalImageUri } from '../../services/flashcards.service';
import { getErrorMessage, isNetworkError } from '../../utils/errors';
import { pickImageFromLibrary } from '../../utils/imagePicker';
import CachedImage from '../../components/CachedImage';
import ScreenHeader from '../../components/ui/ScreenHeader';
import FormField from '../../components/ui/FormField';
import PressableScale from '../../components/ui/PressableScale';
import IconButton from '../../components/ui/IconButton';

function SegmentedControl({ value, options, onChange }) {
  return (
    <View className="mb-4 flex-row rounded-xl bg-default p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            scaleTo={0.98}
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center rounded-lg py-2 ${active ? 'bg-surface' : ''}`}
          >
            <Typography type="body-sm" weight={active ? 'semibold' : 'medium'} className={active ? 'text-foreground' : 'text-muted'}>
              {option.label}
            </Typography>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default function NewFlashCard() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const feedback = useFeedback();
  const { toast, confirm, actionSheet } = feedback;

  const [selectedDeckId, setSelectedDeckId] = useState(route.params?.deckId ? String(route.params.deckId) : '');
  const [englishWord, setEnglishWord] = useState('');
  const [spanishTranslation, setSpanishTranslation] = useState('');
  const [image, setImage] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [gifUrl, setGifUrl] = useState('');
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (!userId) { setLoadingDecks(false); return; }
        try {
          const data = await getDecks(userId, false);
          if (isActive) setDecks(data.filter((d) => !d.is_system));
        } catch (err) {
          if (isActive) toast.error('No se pudieron cargar tus mazos', { message: getErrorMessage(err) });
        } finally {
          if (isActive) setLoadingDecks(false);
        }
      })();
      return () => { isActive = false; };
    }, [userId, toast]),
  );

  const selectedDeck = decks.find((d) => String(d.deck_id) === selectedDeckId);

  const openDeckPicker = () => {
    if (decks.length === 0) {
      toast.info('Aún no tienes mazos', { message: 'Crea un mazo desde la pantalla de inicio.' });
      return;
    }
    actionSheet({
      title: 'Elegir mazo',
      options: decks.map((deck) => ({
        key: String(deck.deck_id),
        label: deck.deck_name,
        icon: Layers,
        selected: String(deck.deck_id) === selectedDeckId,
        onPress: () => {
          setSelectedDeckId(String(deck.deck_id));
          setFieldErrors((prev) => ({ ...prev, deck: null }));
        },
      })),
    });
  };

  const pickImage = async () => {
    const asset = await pickImageFromLibrary(feedback);
    if (asset) setImage(asset.uri);
  };

  const validate = () => {
    const errors = {};
    if (!englishWord.trim()) errors.word = 'Escribe la palabra en inglés.';
    if (!spanishTranslation.trim()) errors.translation = 'Escribe la traducción.';
    if (!selectedDeckId) errors.deck = 'Elige un mazo.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Sube la imagen si hace falta. Devuelve la URL, null o `undefined` si el usuario cancela. */
  const resolveImageUrl = async () => {
    if (mediaType === 'gif') return gifUrl.trim() || null;
    if (!image) return null;
    if (!isLocalImageUri(image)) return image;

    const askSaveWithoutImage = () => confirm({
      title: 'Sin conexión para subir la imagen',
      message: 'Las imágenes necesitan Internet. Puedes guardar la tarjeta ahora sin imagen y añadirla después.',
      confirmText: 'Guardar sin imagen',
      cancelText: 'Esperar',
      icon: WifiOff,
    }).then((ok) => (ok ? null : undefined));

    if (!isOnline) return askSaveWithoutImage();
    try {
      return await uploadFlashcardImage(image);
    } catch (err) {
      if (isNetworkError(err)) return askSaveWithoutImage();
      throw err;
    }
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const imageUrl = await resolveImageUrl();
      if (imageUrl === undefined) return;

      const { offline } = await createFlashcard(userId, {
        word: englishWord.trim(),
        translation: spanishTranslation.trim(),
        imageUrl,
        deckId: selectedDeckId,
      });
      navigation.goBack();
      if (offline) toast.offline('Tarjeta guardada en el dispositivo', { message: 'Se sincronizará al volver la conexión.' });
      else toast.success('¡Flashcard creada!');
    } catch (err) {
      toast.error('No se pudo crear la flashcard', { message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Nueva flashcard" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField
            label="Palabra en inglés"
            required
            icon={Type}
            placeholder="ej. Apple"
            value={englishWord}
            onChangeText={(text) => { setEnglishWord(text); setFieldErrors((p) => ({ ...p, word: null })); }}
            autoCapitalize="none"
            error={fieldErrors.word}
          />
          <FormField
            label="Traducción en español"
            required
            icon={Globe}
            placeholder="ej. Manzana"
            value={spanishTranslation}
            onChangeText={(text) => { setSpanishTranslation(text); setFieldErrors((p) => ({ ...p, translation: null })); }}
            error={fieldErrors.translation}
          />

          {/* Selector de mazo */}
          <Typography type="body-sm" weight="semibold" className="mb-1.5">
            Mazo<Typography type="body-sm" className="text-accent"> *</Typography>
          </Typography>
          <PressableScale
            onPress={openDeckPicker}
            disabled={loadingDecks}
            scaleTo={0.99}
            accessibilityLabel="Elegir mazo"
            className="mb-1 h-[52px] flex-row items-center gap-2.5 rounded-2xl bg-field px-4"
            style={{ borderWidth: 1, borderColor: fieldErrors.deck ? theme.colors.danger : theme.colors.border }}
          >
            <Layers color={theme.colors.subtle} size={18} />
            {loadingDecks ? (
              <View className="flex-1"><Spinner size="sm" /></View>
            ) : (
              <Typography type="body" className={`flex-1 ${selectedDeck ? 'text-foreground' : 'text-muted'}`} numberOfLines={1}>
                {selectedDeck?.deck_name ?? (decks.length > 0 ? 'Elige un mazo…' : 'No tienes mazos')}
              </Typography>
            )}
            <ChevronDown color={theme.colors.subtle} size={18} />
          </PressableScale>
          {fieldErrors.deck ? (
            <Typography type="body-xs" className="mb-3 mt-0.5 text-danger">{fieldErrors.deck}</Typography>
          ) : <View className="mb-4" />}

          {/* Media */}
          <Typography type="body-sm" weight="semibold" className="mb-2">Imagen (opcional)</Typography>
          <SegmentedControl
            value={mediaType}
            onChange={(next) => { setMediaType(next); if (next === 'gif') setImage(null); else setGifUrl(''); }}
            options={[{ value: 'image', label: 'Foto' }, { value: 'gif', label: 'GIF por URL' }]}
          />

          {mediaType === 'image' ? (
            <PressableScale
              onPress={pickImage}
              scaleTo={0.99}
              accessibilityLabel={image ? 'Cambiar imagen' : 'Elegir imagen'}
              className="mb-5 h-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface"
            >
              {image ? (
                <>
                  <CachedImage uri={image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  <View className="absolute right-2 top-2">
                    <IconButton variant="soft" accessibilityLabel="Quitar imagen" onPress={() => setImage(null)} className="h-9 w-9">
                      <X color={theme.colors.foreground} size={16} />
                    </IconButton>
                  </View>
                </>
              ) : (
                <View className="items-center gap-2">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <ImagePlus color={theme.colors.primary} size={22} />
                  </View>
                  <Typography type="body-sm" weight="semibold">Añadir una referencia visual</Typography>
                  <Typography type="body-xs" color="muted">
                    {isOnline ? 'JPG o PNG desde tu galería' : 'Requiere conexión para subirse'}
                  </Typography>
                </View>
              )}
            </PressableScale>
          ) : (
            <View className="mb-5">
              <FormField
                icon={Link2}
                placeholder="https://ejemplo.com/animacion.gif"
                value={gifUrl}
                onChangeText={setGifUrl}
                autoCapitalize="none"
                keyboardType="url"
                className="mb-3"
              />
              {gifUrl ? (
                <View className="overflow-hidden rounded-2xl border border-border bg-default">
                  <CachedImage uri={gifUrl} style={{ width: '100%', height: 160 }} contentFit="cover" />
                </View>
              ) : null}
            </View>
          )}

          {/* Consejo */}
          <View className="mb-6 flex-row items-start gap-3 rounded-2xl bg-accent/5 px-4 py-4">
            <Lightbulb color={theme.colors.primary} size={18} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Typography type="body-sm" weight="bold" className="mb-0.5">Consejo</Typography>
              <Typography type="body-xs" color="muted" className="leading-4">
                Una imagen relevante ayuda a tu memoria a crear asociaciones más fuertes con la palabra.
              </Typography>
            </View>
          </View>

          <Button size="lg" className="w-full" onPress={handleSave} isDisabled={saving}>
            {saving ? <Spinner color={theme.colors.onPrimary} size="sm" /> : (
              <>
                <Save color={theme.colors.onPrimary} size={18} />
                <Button.Label>Guardar tarjeta</Button.Label>
              </>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
