import React, { useState, useCallback } from 'react';
import { View, FlatList, Image, Alert, Modal, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, Edit2, Volume2, ChevronRight, Plus, Image as ImageIcon, Search } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth, getUserId } from '../../context/AuthContext';
import { getDeckFlashcards, updateDeck, deleteDeck } from '../../services/decks.service';

export default function DeckDetailsScreen({ route, navigation }) {
  const { deck } = route.params;
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const insets = useSafeAreaInsets();

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deckName, setDeckName] = useState(deck.deck_name || 'Mazo');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editNameInput, setEditNameInput] = useState(deckName);

  const primaryColor = theme.colors.primaryLight || theme.colors.primary;

  useFocusEffect(useCallback(() => { fetchFlashcards(); }, []));

  const fetchFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeckFlashcards(deck.deck_id);
      setFlashcards(data);
    } catch (err) {
      setError('No se pudieron cargar las flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (flashcards.length === 0) {
      Alert.alert('Sin contenido', 'Agrega tarjetas al mazo antes de compartirlo.');
      return;
    }
    const lines = flashcards.map((c) => `• ${c.word} → ${c.translation}`).join('\n');
    await Share.share({
      title: `Mazo: ${deckName}`,
      message: `📚 Mazo de vocabulario: ${deckName}\n\n${lines}\n\n(Compartido desde Engli-Cards)`,
    });
  };

  const handleOptionsMenu = () => {
    Alert.alert(deckName, '¿Qué deseas hacer con este mazo?', [
      { text: 'Renombrar', onPress: () => { setEditNameInput(deckName); setEditModalVisible(true); } },
      { text: 'Compartir', onPress: handleShare },
      { text: 'Eliminar mazo', style: 'destructive', onPress: handleDeleteDeck },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSpeak = (word) => {
    if (!word) return;
    Speech.stop();
    Speech.speak(word, { language: 'en-US', pitch: 1.0, rate: 1.0 });
  };

  const handleSaveDeckName = async () => {
    if (!editNameInput.trim()) return;
    if (!userId) { Alert.alert('Error', 'No se encontró tu ID de usuario.'); return; }
    try {
      await updateDeck(deck.deck_id, editNameInput, userId);
      setDeckName(editNameInput);
      setEditModalVisible(false);
      Alert.alert('Éxito', 'Mazo actualizado correctamente');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el mazo');
    }
  };

  const handleDeleteDeck = () => {
    Alert.alert('Eliminar Mazo', '¿Estás seguro que deseas eliminar este mazo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          if (!userId) { Alert.alert('Error', 'No se encontró tu ID de usuario.'); return; }
          try {
            await deleteDeck(deck.deck_id, userId);
            Alert.alert('Éxito', 'Mazo eliminado correctamente', [
              { text: 'OK', onPress: () => { setEditModalVisible(false); navigation.goBack(); } },
            ]);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el mazo');
          }
        },
      },
    ]);
  };

  const filteredCards = flashcards.filter((card) =>
    card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      {/* Edit Name Modal */}
      <Modal transparent visible={isEditModalVisible} animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View className="flex-1 bg-backdrop items-center justify-center px-5">
          <Card className="w-full">
            <Card.Body className="px-5 py-6">
              <Typography type="h4" weight="bold" align="center" className="mb-4">Editar Mazo</Typography>
              <Typography type="body-sm" color="muted" className="mb-2">Nuevo Nombre:</Typography>
              <Input
                className="mb-5"
                value={editNameInput}
                onChangeText={setEditNameInput}
                placeholder="Ej. Frutas"
              />
              <Button size="lg" className="w-full mb-3" onPress={handleSaveDeckName}>
                <Button.Label>Guardar</Button.Label>
              </Button>
              <Button variant="secondary" size="lg" className="w-full" onPress={() => setEditModalVisible(false)}>
                <Button.Label>Cancelar</Button.Label>
              </Button>
            </Card.Body>
          </Card>
        </View>
      </Modal>

      {/* Header */}
      <View className="bg-background-secondary px-5 pb-6" style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.foreground} size={24} />
          </Button>
          <Typography type="h5" weight="bold">Mazo de Estudio</Typography>
          <Button isIconOnly variant="ghost" onPress={handleOptionsMenu}>
            <MoreVertical color={theme.colors.foreground} size={24} />
          </Button>
        </View>

        {/* Info */}
        <View className="bg-accent/10 px-3 py-1.5 rounded-full self-start mb-3">
          <Typography type="body-xs" weight="bold" className="text-accent uppercase tracking-widest">
            MAZO DE VOCABULARIO
          </Typography>
        </View>
        <Typography type="h2" weight="bold" className="mb-1">{deckName}</Typography>
        <Typography type="body-sm" color="muted" className="mb-4">
          {flashcards.length || deck.cardCount || 0} Tarjetas en este mazo
        </Typography>

        <View className="flex-row gap-3">
          <Button
            isIconOnly
            variant="secondary"
            className="rounded-full"
            onPress={() => { setEditNameInput(deckName); setEditModalVisible(true); }}
          >
            <Edit2 color={theme.colors.foreground} size={18} />
          </Button>

          {flashcards.length >= 5 && (
            <Button
              variant="primary"
              className="rounded-xl px-4"
              onPress={() => navigation.navigate('DeckQuiz', { deckId: deck.deck_id, deckName })}
            >
              <Button.Label>Practicar Quiz</Button.Label>
              <ChevronRight color="#FFF" size={16} />
            </Button>
          )}
        </View>
      </View>

      {/* List Area */}
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Typography type="h5" weight="bold">Lista de Flashcards</Typography>
          <Typography type="body-xs" color="muted">Ordenar por: Recientes</Typography>
        </View>

        <View className="flex-row items-center bg-default rounded-xl px-4 mb-4 h-11 gap-2">
          <Search color={theme.colors.mutedForeground} size={18} />
          <Input
            className="flex-1 bg-transparent"
            placeholder="Buscar flashcard..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View className="mt-5 items-center">
            <Spinner size="lg" />
          </View>
        ) : error ? (
          <Typography type="body-sm" className="text-danger text-center mt-5">{error}</Typography>
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <Card className="mb-3" onPress={() => navigation.navigate('UpdateFlashCard', { card: item })}>
                <Card.Body className="flex-row items-center px-4 py-3">
                  <View className="w-12 h-12 rounded-full bg-default items-center justify-center mr-4 overflow-hidden">
                    {item.image_url
                      ? <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      : <ImageIcon color="#A1CFC9" size={22} />
                    }
                  </View>
                  <View className="flex-1">
                    <Typography type="body" weight="semibold">{item.word}</Typography>
                    <Typography type="body-sm" color="muted">{item.translation}</Typography>
                  </View>
                  <Button isIconOnly variant="ghost" size="sm" onPress={() => handleSpeak(item.word)}>
                    <Volume2 color="#A1A1A1" size={20} />
                  </Button>
                  <ChevronRight color="#D1D1D1" size={20} />
                </Card.Body>
              </Card>
            )}
            ListEmptyComponent={() => (
              <Typography type="body" color="muted" align="center" className="mt-5 italic">
                No se encontraron resultados.
              </Typography>
            )}
            ListFooterComponent={() => (
              <Card className="mt-5 mb-12 border-2 border-dashed border-accent/30 bg-transparent">
                <Card.Body className="items-center py-6">
                  <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center mb-3">
                    <Plus color={primaryColor} size={24} />
                  </View>
                  <Typography type="body" weight="bold" className="mb-1">¿Quieres añadir más?</Typography>
                  <Typography type="body-sm" color="muted" align="center" className="mb-4">
                    Sigue ampliando tu vocabulario agregando nuevas tarjetas.
                  </Typography>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => navigation.navigate('NewFlashCard', { deckId: deck.deck_id })}
                  >
                    <Button.Label>Añadir tarjeta</Button.Label>
                  </Button>
                </Card.Body>
              </Card>
            )}
          />
        )}
      </View>
    </View>
  );
}
