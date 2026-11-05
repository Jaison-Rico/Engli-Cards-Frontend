import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Share, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, Pencil, Volume2, Plus, Image as ImageIcon, Share2, Trash2,
  GraduationCap, AlertCircle, CloudOff, Layers,
} from 'lucide-react-native';
import { speak } from '../../services/tts';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth, getUserId } from '../../context/AuthContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import TextPromptModal from '../../components/feedback/TextPromptModal';
import { getDeckFlashcards, updateDeck, deleteDeck } from '../../services/decks.service';
import { getErrorMessage } from '../../utils/errors';
import CachedImage from '../../components/CachedImage';
import ListCard from '../../components/ui/ListCard';
import IconButton from '../../components/ui/IconButton';
import SearchField from '../../components/ui/SearchField';
import EmptyState from '../../components/ui/EmptyState';
import PressableScale from '../../components/ui/PressableScale';

const MIN_CARDS_FOR_QUIZ = 5;

export default function DeckDetailsScreen({ route, navigation }) {
  const { deck } = route.params;
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const insets = useSafeAreaInsets();
  const { toast, confirm, actionSheet } = useFeedback();

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deckName, setDeckName] = useState(deck.deck_name || 'Mazo');
  const [searchQuery, setSearchQuery] = useState('');
  const [renameVisible, setRenameVisible] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    setError(null);
    try {
      const data = await getDeckFlashcards(deck.deck_id, userId);
      setFlashcards(data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las flashcards.'));
    } finally {
      setLoading(false);
    }
  }, [deck.deck_id, userId]);

  useFocusEffect(useCallback(() => { fetchFlashcards(); }, [fetchFlashcards]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFlashcards();
    setRefreshing(false);
  };

  const handleShare = async () => {
    if (flashcards.length === 0) {
      toast.info('Este mazo está vacío', { message: 'Agrega tarjetas antes de compartirlo.' });
      return;
    }
    const lines = flashcards.map((c) => `• ${c.word} → ${c.translation}`).join('\n');
    await Share.share({
      title: `Mazo: ${deckName}`,
      message: `📚 Mazo de vocabulario: ${deckName}\n\n${lines}\n\n(Compartido desde Engli-Cards)`,
    }).catch(() => {});
  };

  const handleRename = async (name) => {
    if (!userId) throw new Error('No se encontró tu sesión.');
    const { offline } = await updateDeck(deck.deck_id, name, userId);
    setDeckName(name);
    setRenameVisible(false);
    if (offline) toast.offline('Cambio guardado en el dispositivo', { message: 'Se sincronizará al volver la conexión.' });
    else toast.success('Mazo renombrado');
  };

  const handleDeleteDeck = async () => {
    const ok = await confirm({
      title: '¿Eliminar este mazo?',
      message: `Se eliminará “${deckName}” y sus ${flashcards.length} tarjetas. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar mazo',
      destructive: true,
      icon: Trash2,
    });
    if (!ok) return;
    if (!userId) { toast.error('No se encontró tu sesión'); return; }
    try {
      const { offline } = await deleteDeck(deck.deck_id, userId);
      navigation.goBack();
      if (offline) toast.offline('Mazo eliminado en el dispositivo', { message: 'Se eliminará del servidor al volver la conexión.' });
      else toast.success('Mazo eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el mazo', { message: getErrorMessage(err) });
    }
  };

  const openOptions = () => {
    actionSheet({
      title: deckName,
      options: [
        { label: 'Renombrar', icon: Pencil, onPress: () => setRenameVisible(true) },
        { label: 'Compartir', icon: Share2, onPress: handleShare },
        { label: 'Eliminar mazo', icon: Trash2, destructive: true, onPress: handleDeleteDeck },
      ],
    });
  };

  // Usa el servicio TTS: elige la voz inglesa instalada (antes podía leer con la voz por defecto).
  const handleSpeak = useCallback((word) => speak(word, { lang: 'en', rate: 1.0 }), []);

  const filteredCards = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return flashcards;
    return flashcards.filter((card) =>
      card.word?.toLowerCase().includes(term) || card.translation?.toLowerCase().includes(term));
  }, [flashcards, searchQuery]);

  const cardCount = flashcards.length || (loading ? deck.cardCount || 0 : 0);
  const canQuiz = flashcards.length >= MIN_CARDS_FOR_QUIZ;

  const startQuiz = () => {
    if (canQuiz) navigation.navigate('DeckQuiz', { deckId: deck.deck_id, deckName });
    else toast.info(`Necesitas al menos ${MIN_CARDS_FOR_QUIZ} tarjetas`, { message: `Este mazo tiene ${flashcards.length}.` });
  };

  const renderCard = useCallback(({ item }) => (
    <ListCard
      className="mb-2.5"
      title={item.word}
      subtitle={item.translation}
      onPress={() => navigation.navigate('UpdateFlashCard', { card: item, deckId: deck.deck_id })}
      badge={item.pending ? <CloudOff color={theme.colors.warning} size={14} /> : null}
      leading={(
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-default">
          {item.image_url
            ? <CachedImage uri={item.image_url} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            : <ImageIcon color={theme.colors.subtle} size={20} />}
        </View>
      )}
      trailing={(
        <IconButton accessibilityLabel={`Escuchar ${item.word}`} onPress={() => handleSpeak(item.word)}>
          <Volume2 color={theme.colors.muted} size={20} />
        </IconButton>
      )}
    />
  ), [navigation, theme, handleSpeak, deck]);

  return (
    <View className="flex-1 bg-background">
      <TextPromptModal
        visible={renameVisible}
        title="Renombrar mazo"
        label="Nuevo nombre"
        placeholder="Ej. Frutas"
        initialValue={deckName}
        onSubmit={handleRename}
        onClose={() => setRenameVisible(false)}
      />

      {/* Cabecera */}
      <View className="border-b border-border bg-surface px-5 pb-5" style={{ paddingTop: insets.top + 4 }}>
        <View className="-mx-2 mb-3 h-14 flex-row items-center justify-between">
          <IconButton accessibilityLabel="Volver" onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.foreground} size={22} />
          </IconButton>
          <IconButton accessibilityLabel="Opciones del mazo" onPress={openOptions}>
            <MoreVertical color={theme.colors.foreground} size={22} />
          </IconButton>
        </View>

        <View className="mb-2 self-start rounded-full bg-accent/10 px-3 py-1">
          <Typography type="body-xs" weight="bold" className="uppercase tracking-widest text-accent">
            Mazo de vocabulario
          </Typography>
        </View>
        <PressableScale
          onPress={() => setRenameVisible(true)}
          haptic={null}
          scaleTo={0.99}
          accessibilityLabel={`Renombrar ${deckName}`}
          className="flex-row items-center gap-2 self-start"
        >
          <Typography type="h3" weight="bold" className="tracking-tight" numberOfLines={2}>{deckName}</Typography>
          <Pencil color={theme.colors.subtle} size={16} />
        </PressableScale>
        <Typography type="body-sm" color="muted" className="mb-4 mt-1">
          {cardCount} {cardCount === 1 ? 'tarjeta' : 'tarjetas'} en este mazo
        </Typography>

        <View className="flex-row gap-2.5">
          <Button
            className="flex-1"
            variant={canQuiz ? 'primary' : 'secondary'}
            onPress={startQuiz}
          >
            <GraduationCap color={canQuiz ? theme.colors.onPrimary : theme.colors.muted} size={18} />
            <Button.Label className={canQuiz ? '' : 'text-muted'}>Practicar quiz</Button.Label>
          </Button>
          <Button
            variant="secondary"
            onPress={() => navigation.navigate('NewFlashCard', { deckId: deck.deck_id })}
          >
            <Plus color={theme.colors.foreground} size={18} />
            <Button.Label className="text-foreground">Tarjeta</Button.Label>
          </Button>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={loading || error ? [] : filteredCards}
        keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
        ListHeaderComponent={flashcards.length > 0 ? (
          <View className="mb-4">
            <View className="mb-3 flex-row items-baseline justify-between">
              <Typography type="h6" weight="bold">Flashcards</Typography>
              <Typography type="body-xs" color="muted">Toca una para editarla</Typography>
            </View>
            <SearchField value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar flashcard" />
          </View>
        ) : null}
        ListEmptyComponent={() => {
          if (loading) return <View className="items-center py-12"><Spinner size="lg" /></View>;
          if (error) {
            return (
              <EmptyState
                icon={AlertCircle}
                tone="danger"
                title="No pudimos cargar las tarjetas"
                description={error}
                actionLabel="Reintentar"
                onAction={() => { setLoading(true); fetchFlashcards(); }}
              />
            );
          }
          if (searchQuery) return <EmptyState title="Sin resultados" description={`Nada coincide con “${searchQuery}”.`} />;
          return (
            <EmptyState
              icon={Layers}
              title="Este mazo está vacío"
              description="Agrega tu primera tarjeta para empezar a estudiar."
              actionLabel="Añadir tarjeta"
              onAction={() => navigation.navigate('NewFlashCard', { deckId: deck.deck_id })}
            />
          );
        }}
        ListFooterComponent={!loading && !error && flashcards.length > 0 ? (
          <PressableScale
            onPress={() => navigation.navigate('NewFlashCard', { deckId: deck.deck_id })}
            className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/40 py-4"
            accessibilityLabel="Añadir tarjeta"
          >
            <Plus color={theme.colors.primary} size={18} />
            <Typography type="body-sm" weight="semibold" className="text-accent">Añadir tarjeta</Typography>
          </PressableScale>
        ) : null}
      />
    </View>
  );
}
