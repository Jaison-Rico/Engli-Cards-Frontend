import React, { useState } from 'react';
import { View, ScrollView, Modal, Image, Alert, StatusBar } from 'react-native';
import { Trash2, Save, ArrowLeft, Type, Globe, Aperture, CheckCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../../config/api';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function UpdateFlashCard() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { card } = route.params;

  const [englishWord, setEnglishWord] = useState(card.word || '');
  const [spanishTranslation, setSpanishTranslation] = useState(card.translation || '');
  const [image, setImage] = useState(card.image_url || null);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
      if (!result.canceled && result.assets?.length) setImage(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'No pudimos abrir tu galería.');
    }
  };

  const handleUpdate = async () => {
    if (!englishWord.trim() || !spanishTranslation.trim()) {
      setError('Campos obligatorios vacíos.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const storedUser = await SecureStore.getItemAsync('userInfo');
      const user = JSON.parse(storedUser);
      const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

      let finalImageUrl = image;
      if (image && !image.startsWith('http')) {
        const formData = new FormData();
        const ext = (image.split('.').pop() || 'jpg').toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        formData.append('image', { uri: image, name: `flashcard.${ext}`, type: mime });
        const uploadResp = await axios.post(`${config.BASE_URL}/cloudinary/upload-flashcard`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = uploadResp.data.imageUrl;
      }

      await axios.patch(`${config.BASE_URL}/flashcards/${card.id}`, {
        word: englishWord,
        translation: spanishTranslation,
        image_url: finalImageUrl,
        user_id: +userId,
      });

      setSuccessModalVisible(true);
      setTimeout(() => { setSuccessModalVisible(false); navigation.goBack(); }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar Tarjeta', '¿Estás seguro de que quieres borrar esta flashcard?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const storedUser = await SecureStore.getItemAsync('userInfo');
            const user = JSON.parse(storedUser);
            const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
            await axios.delete(`${config.BASE_URL}/flashcards/${card.id}`, { data: { userId: +userId } });
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background-secondary">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 bg-transparent" style={{ paddingTop: insets.top + 10 }}>
        <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
          <ArrowLeft color="#08302E" size={24} />
        </Button>
        <Typography type="h5" weight="bold" className="text-foreground">Editar Flashcard</Typography>
        <Button isIconOnly variant="ghost" onPress={handleDelete}>
          <Trash2 color="#08302E" size={24} />
        </Button>
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface rounded-t-3xl mt-4 overflow-hidden">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

          {/* Image Upload */}
          <Button
            variant="ghost"
            className="w-full h-44 rounded-3xl overflow-hidden mb-6 bg-default border-0"
            onPress={pickImage}
          >
            {image ? (
              <View className="w-full h-full">
                <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  <Aperture size={14} color="#086B67" />
                  <Typography type="body-xs" weight="semibold" className="text-[#086B67]">Cambiar Imagen</Typography>
                </View>
              </View>
            ) : (
              <View className="items-center gap-2">
                <Aperture color="#086B67" size={32} />
                <Typography type="body-sm" weight="semibold">Añadir Imagen</Typography>
              </View>
            )}
          </Button>

          {/* English Word */}
          <Typography type="body-sm" weight="semibold" className="mb-2 mt-2">Palabra en Inglés</Typography>
          <View className="flex-row items-center bg-background border border-border rounded-xl px-4 mb-4 h-12 gap-3">
            <Input className="flex-1 bg-transparent" value={englishWord} onChangeText={setEnglishWord} />
            <Type color="#A1CFC9" size={20} />
          </View>

          {/* Spanish Translation */}
          <Typography type="body-sm" weight="semibold" className="mb-2">Traducción en Español</Typography>
          <View className="flex-row items-center bg-background border border-border rounded-xl px-4 mb-4 h-12 gap-3">
            <Input className="flex-1 bg-transparent" value={spanishTranslation} onChangeText={setSpanishTranslation} />
            <Globe color="#A1CFC9" size={20} />
          </View>

          {error && <Typography type="body-sm" className="text-danger mb-4">{error}</Typography>}

          <Button
            size="lg"
            className="w-full mt-4"
            onPress={handleUpdate}
            isDisabled={loading}
          >
            {loading
              ? <Spinner color="white" size="sm" />
              : (
                <View className="flex-row items-center gap-2">
                  <CheckCircle color="#fff" size={20} />
                  <Button.Label>Actualizar Tarjeta</Button.Label>
                </View>
              )
            }
          </Button>
        </ScrollView>
      </View>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-backdrop items-center justify-center px-8">
          <Card className="w-full">
            <Card.Body className="items-center py-10">
              <CheckCircle size={60} color="#12B5B0" />
              <Typography type="h4" weight="bold" className="mt-4 mb-2">¡Actualizada!</Typography>
              <Typography type="body-sm" color="muted" align="center">La tarjeta se guardó con éxito</Typography>
            </Card.Body>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
