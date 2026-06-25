import React, { useState } from 'react';
import { View, ScrollView, Modal, Platform, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Camera, Save, ArrowLeft, ChevronDown, CheckCircle, Type, Globe, Lightbulb, Aperture, User } from 'lucide-react-native';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, getUserId } from '../../context/AuthContext';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';
import client from '../../services/client';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../context/ThemeContext';

export default function NewFlashCard() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();

  const [selectedMazo, setSelectedMazo] = useState('');
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [tempMazo, setTempMazo] = useState('');
  const [englishWord, setEnglishWord] = useState('');
  const [spanishTranslation, setSpanishTranslation] = useState('');
  const [image, setImage] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [gifUrl, setGifUrl] = useState('');
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [creatingFlashcard, setCreatingFlashcard] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS === 'android') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permiso requerido', 'Debes permitir el acceso a tus fotos para seleccionar una imagen.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 1, exif: false });
      if (!result.canceled && result.assets?.length) setImage(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'No pudimos abrir tu galería. Intenta nuevamente.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchDecks = async () => {
        if (!userId) { setError('No se encontró el ID de usuario.'); return; }
        setLoadingDecks(true);
        setError(null);
        try {
          const { getDecks } = await import('../../services/decks.service');
          const data = await getDecks(userId, false);
          if (isActive) setDecks(data.filter((d) => !d.is_system));
        } catch (err) {
          if (isActive) {
            setError(err?.response?.data?.message || err?.message || 'Error al cargar mazos');
            setDecks([]);
          }
        } finally {
          if (isActive) setLoadingDecks(false);
        }
      };
      fetchDecks();
      return () => { isActive = false; };
    }, [])
  );

  const handleCreateFlashCard = async () => {
    if (!englishWord.trim() || !spanishTranslation.trim() || !selectedMazo) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    setCreatingFlashcard(true);
    setError(null);
    try {
      let finalImageUrl = null;
      if (mediaType === 'gif' && gifUrl.trim()) {
        finalImageUrl = gifUrl.trim();
      } else if (mediaType === 'image' && image) {
        const formData = new FormData();
        const uri = image;
        const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
        formData.append('image', { uri, name: `flashcard.${ext}`, type: mime });
        const uploadResponse = await client.post('/cloudinary/upload-flashcard', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        finalImageUrl = uploadResponse.data.imageUrl;
      }
      await client.post('/flashcards', {
        word: englishWord,
        translation: spanishTranslation,
        image_url: finalImageUrl,
        user_id: +userId,
        deck_id: +selectedMazo,
      });
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.goBack();
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al crear la flashcard. Intenta de nuevo.');
    } finally {
      setCreatingFlashcard(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-surface shadow-surface">
        <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
          <ArrowLeft color="#12B5B0" size={24} />
        </Button>
        <Typography type="h5" weight="bold">Crear Flashcard</Typography>
        <View className="w-10 h-10 rounded-full bg-default items-center justify-center">
          <User color="#08302E" size={20} />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

        {/* English Word */}
        <Typography type="body-sm" weight="semibold" className="mb-2">
          Palabra en Inglés <Typography type="body-sm" className="text-accent">*</Typography>
        </Typography>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 mb-4 h-12 gap-3">
          <Input className="flex-1 bg-transparent" placeholder="ej. Apple" value={englishWord} onChangeText={setEnglishWord} />
          <Type color="#A1CFC9" size={20} />
        </View>

        {/* Spanish Translation */}
        <Typography type="body-sm" weight="semibold" className="mb-2">
          Traducción en Español <Typography type="body-sm" className="text-accent">*</Typography>
        </Typography>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 mb-4 h-12 gap-3">
          <Input className="flex-1 bg-transparent" placeholder="ej. Manzana" value={spanishTranslation} onChangeText={setSpanishTranslation} />
          <Globe color="#A1CFC9" size={20} />
        </View>

        {/* Deck Selector */}
        <Typography type="body-sm" weight="semibold" className="mb-2">
          Seleccionar un Mazo <Typography type="body-sm" className="text-accent">*</Typography>
        </Typography>
        {loadingDecks ? (
          <View className="h-12 bg-surface border border-border rounded-xl items-center justify-center mb-4">
            <Spinner size="sm" />
          </View>
        ) : (
          <Button
            variant="secondary"
            className="w-full rounded-xl h-12 mb-4 justify-between px-4"
            onPress={() => {
              if (decks.length > 0) {
                setTempMazo(selectedMazo || String(decks[0].deck_id));
                setIosPickerVisible(true);
              }
            }}
            isDisabled={decks.length === 0}
          >
            <Typography type="body-sm" className={!selectedMazo ? 'text-muted' : 'text-foreground'}>
              {selectedMazo
                ? decks.find((d) => String(d.deck_id) === selectedMazo)?.deck_name || 'Mazo seleccionado'
                : decks.length > 0 ? 'Elige un mazo...' : 'No hay mazos'
              }
            </Typography>
            <ChevronDown color="#A1CFC9" size={20} />
          </Button>
        )}

        {/* Picker Modal */}
        <Modal visible={iosPickerVisible} transparent animationType="slide" onRequestClose={() => setIosPickerVisible(false)}>
          <View className="flex-1 justify-end">
            <View className="bg-surface rounded-t-3xl p-6 shadow-overlay">
              <Typography type="h5" weight="bold" align="center" className="mb-4">Seleccionar un Mazo</Typography>
              {decks.length === 0 ? (
                <Typography type="body-sm" color="muted" align="center" className="py-5">
                  No tienes mazos disponibles. Crea uno primero.
                </Typography>
              ) : Platform.OS === 'ios' ? (
                <Picker selectedValue={tempMazo} onValueChange={(val) => setTempMazo(val)}>
                  {decks.map((deck) => (
                    <Picker.Item key={deck.deck_id} label={deck.deck_name} value={String(deck.deck_id)} />
                  ))}
                </Picker>
              ) : (
                <ScrollView style={{ maxHeight: 300 }}>
                  {decks.map((deck) => (
                    <Button
                      key={deck.deck_id}
                      variant={tempMazo === String(deck.deck_id) ? 'primary' : 'ghost'}
                      className="w-full mb-1 justify-start"
                      onPress={() => setTempMazo(String(deck.deck_id))}
                    >
                      <Button.Label className={tempMazo === String(deck.deck_id) ? 'text-accent-foreground' : 'text-foreground'}>
                        {deck.deck_name}
                      </Button.Label>
                    </Button>
                  ))}
                </ScrollView>
              )}
              <View className="flex-row gap-3 mt-4">
                <Button variant="secondary" className="flex-1" onPress={() => setIosPickerVisible(false)}>
                  <Button.Label>Cancelar</Button.Label>
                </Button>
                <Button className="flex-1" isDisabled={decks.length === 0} onPress={() => { setSelectedMazo(tempMazo); setIosPickerVisible(false); }}>
                  <Button.Label>Aceptar</Button.Label>
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {error && <Typography type="body-sm" className="text-danger mb-3">{error}</Typography>}

        {/* Media Toggle */}
        <Typography type="body-sm" weight="semibold" className="mb-3">Añadir Media</Typography>
        <View className="flex-row gap-2 mb-4">
          <Button
            variant={mediaType === 'image' ? 'primary' : 'outline'}
            className="flex-1"
            onPress={() => { setMediaType('image'); setGifUrl(''); }}
          >
            <Button.Label>Imagen</Button.Label>
          </Button>
          <Button
            variant={mediaType === 'gif' ? 'primary' : 'outline'}
            className="flex-1"
            onPress={() => { setMediaType('gif'); setImage(null); }}
          >
            <Button.Label>GIF</Button.Label>
          </Button>
        </View>

        {/* Image Upload */}
        {mediaType === 'image' && (
          <Button
            variant="ghost"
            className="w-full h-40 border-2 border-dashed border-border rounded-2xl mb-4"
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 16 }} resizeMode="cover" />
            ) : (
              <View className="items-center gap-2">
                <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center">
                  <Aperture color="#086B67" size={24} />
                </View>
                <Typography type="body-sm" weight="semibold">Subir una referencia visual</Typography>
                <Typography type="body-xs" color="muted">JPG, PNG hasta 5MB</Typography>
              </View>
            )}
          </Button>
        )}

        {/* GIF URL */}
        {mediaType === 'gif' && (
          <View className="mb-4">
            <Typography type="body-sm" weight="semibold" className="mb-2">URL del GIF</Typography>
            <View className="bg-surface border border-border rounded-xl px-4 h-12">
              <Input
                className="flex-1 bg-transparent h-full"
                placeholder="https://ejemplo.com/animation.gif"
                value={gifUrl}
                onChangeText={setGifUrl}
              />
            </View>
            {gifUrl ? (
              <View className="mt-3 rounded-xl overflow-hidden bg-default p-2">
                <Image
                  source={{ uri: gifUrl }}
                  style={{ width: '100%', height: 160, borderRadius: 8 }}
                  resizeMode="cover"
                  onError={() => Alert.alert('Error', 'No se pudo cargar el GIF. Verifica la URL.')}
                />
              </View>
            ) : null}
          </View>
        )}

        {/* Tip Block */}
        <Card className="mb-6 bg-accent/5">
          <Card.Body className="flex-row items-start gap-3 px-4 py-4">
            <Lightbulb color="#086B67" size={20} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Typography type="body-sm" weight="bold" className="mb-1">Tip del Erudito</Typography>
              <Typography type="body-sm" color="muted">
                Añadir una imagen relevante ayuda a tu cerebro a crear conexiones neuronales más fuertes y memorizar hasta un 40% más rápido.
              </Typography>
            </View>
          </Card.Body>
        </Card>

        {/* Save Button */}
        <Button
          size="lg"
          className="w-full mb-8"
          onPress={handleCreateFlashCard}
          isDisabled={creatingFlashcard}
        >
          {creatingFlashcard
            ? <Spinner color="white" size="sm" />
            : (
              <View className="flex-row items-center gap-2">
                <Save color="#fff" size={20} />
                <Button.Label>Guardar Tarjeta</Button.Label>
              </View>
            )
          }
        </Button>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-backdrop items-center justify-center px-8">
          <Card className="w-full">
            <Card.Body className="items-center py-10">
              <CheckCircle size={60} color="#12B5B0" />
              <Typography type="h4" weight="bold" className="mt-4 mb-2">¡Flashcard creada!</Typography>
              <Typography type="body-sm" color="muted" align="center">
                Tu tarjeta se ha guardado exitosamente
              </Typography>
            </Card.Body>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
