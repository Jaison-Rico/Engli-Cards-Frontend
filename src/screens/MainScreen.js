import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, StatusBar, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Plus, Flame, BarChart3, Layers, CloudOff, Play, AlertCircle } from 'lucide-react-native';
import { Spinner, Typography } from 'heroui-native';
import SoundManager from '../config/sounds';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth, getUserId } from '../context/AuthContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getDecks } from '../services/decks.service';
import { getUserStats } from '../services/users.service';
import { getErrorMessage } from '../utils/errors';
import CreateDeck from '../components/CreateDeckModal';
import ListCard from '../components/ui/ListCard';
import PressableScale from '../components/ui/PressableScale';
import IconButton from '../components/ui/IconButton';
import SearchField from '../components/ui/SearchField';
import EmptyState from '../components/ui/EmptyState';
import { elevation } from '../theme/theme';
import TopFade from '../components/ui/TopFade';

function QuickAction({ icon: Icon, label, onPress }) {
  const { theme } = useAppTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      className="flex-1 flex-row items-center gap-3 rounded-[20px] border border-border bg-surface px-4 py-4"
      style={elevation(1, theme.mode)}
    >
      <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-accent/10">
        <Icon color={theme.colors.primary} size={20} strokeWidth={2.3} />
      </View>
      <Typography type="body-sm" weight="semibold" className="flex-1" numberOfLines={2}>{label}</Typography>
    </PressableScale>
  );
}

export default function MainScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { toast } = useFeedback();

  const [search, setSearch] = useState('');
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [streak, setStreak] = useState(0);

  // El spinner solo aparece en la primera carga; al volver a la pantalla se
  // refresca en segundo plano sin vaciar la lista.
  const loadData = useCallback(async ({ isActive = () => true } = {}) => {
    if (!userId) {
      setError('No se encontró tu sesión. Inicia sesión nuevamente.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [deckData, statsResult] = await Promise.all([
        getDecks(userId, false),
        getUserStats(userId).catch(() => null),
      ]);
      if (!isActive()) return;
      setDecks(deckData);
      if (statsResult?.data) setStreak(statsResult.data.streak_current || 0);
    } catch (err) {
      if (isActive()) setError(getErrorMessage(err, 'No se pudieron cargar tus mazos.'));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadData({ isActive: () => active });
      return () => { active = false; };
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const personalDecks = useMemo(() => decks.filter((d) => !d.is_system), [decks]);
  const visibleDecks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? personalDecks.filter((d) => d.deck_name?.toLowerCase().includes(term)) : personalDecks;
  }, [personalDecks, search]);

  const studyDeck = (deck) => {
    if (deck.flashcards?.length > 0) {
      navigation.navigate('GameFlashCard', {
        sampleCards: deck.flashcards,
        deckId: deck.deck_id,
        deckName: deck.deck_name,
      });
    } else {
      toast.info('Este mazo está vacío', { message: 'Agrega algunas flashcards antes de estudiar.' });
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'amigo';

  const renderDeck = ({ item }) => {
    const count = item.cardCount ?? 0;
    return (
      <ListCard
        className="mb-2.5"
        title={item.deck_name}
        subtitle={`${count} ${count === 1 ? 'tarjeta' : 'tarjetas'}`}
        onPress={() => navigation.navigate('DeckDetails', { deck: item })}
        showChevron={false}
        badge={item.pending ? <CloudOff color={theme.colors.warning} size={14} /> : null}
        leading={(
          <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-accent/10">
            <Layers color={theme.colors.primary} size={20} />
          </View>
        )}
        trailing={(
          <IconButton
            variant="accent"
            accessibilityLabel={`Estudiar ${item.deck_name}`}
            onPress={() => studyDeck(item)}
            className="h-10 w-10"
          >
            <Play color={theme.colors.onPrimary} fill={theme.colors.onPrimary} size={16} />
          </IconButton>
        )}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <EmptyState
          icon={AlertCircle}
          tone="danger"
          title="No pudimos cargar tus mazos"
          description={error}
          actionLabel="Reintentar"
          onAction={() => { setLoading(true); loadData(); }}
        />
      );
    }
    if (search) {
      return <EmptyState title="Sin resultados" description={`No hay mazos que coincidan con “${search}”.`} />;
    }
    return (
      <EmptyState
        icon={Layers}
        title="Aún no tienes mazos"
        description="Crea tu primer mazo para empezar a guardar vocabulario."
        actionLabel="Crear mazo"
        onAction={() => setModalVisible(true)}
      />
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Cabecera */}
      <View
        className="rounded-b-[28px] bg-surface px-5 pb-5"
        style={[{ paddingTop: insets.top + 14, zIndex: 1 }, elevation(1, theme.mode)]}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Typography type="body-sm" color="muted" numberOfLines={1}>¡Hola, {firstName}!</Typography>
            <Typography type="h3" weight="bold" className="tracking-tight" numberOfLines={1}>Engli Cards</Typography>
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className="h-10 flex-row items-center gap-1 rounded-full bg-[#FFF4EC] px-3 dark:bg-[#3A2416]"
              accessibilityLabel={`Racha de ${streak} días`}
            >
              <Flame color={theme.colors.flame} fill={theme.colors.flame} size={18} />
              <Typography type="body-sm" weight="bold" style={{ color: theme.colors.flame }}>{streak}</Typography>
            </View>
            <IconButton variant="soft" accessibilityLabel="Ver estadísticas" onPress={() => navigation.push('StatsScreen')}>
              <BarChart3 color={theme.colors.foreground} size={20} />
            </IconButton>
          </View>
        </View>

        <SearchField value={search} onChangeText={setSearch} placeholder="Buscar mazo" />
      </View>

      <View className="flex-1">
      <FlatList
        data={visibleDecks}
        keyExtractor={(item, index) => (item.deck_id ? String(item.deck_id) : `deck-${index}`)}
        renderItem={renderDeck}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
        ListHeaderComponent={(
          <>
            <View className="mb-6 flex-row gap-3">
              <QuickAction
                icon={Plus}
                label="Crear mazo"
                onPress={() => { SoundManager.play('click'); setModalVisible(true); }}
              />
              <QuickAction
                icon={BookOpen}
                label="Crear flashcard"
                onPress={() => { SoundManager.play('click'); navigation.push('NewFlashCard'); }}
              />
            </View>
            <View className="mb-3 flex-row items-baseline justify-between">
              <Typography type="h6" weight="bold">Mis mazos</Typography>
              {personalDecks.length > 0 ? (
                <Typography type="body-xs" color="muted">{personalDecks.length} en total</Typography>
              ) : null}
            </View>
            {loading ? <View className="items-center py-10"><Spinner size="lg" /></View> : null}
          </>
        )}
        ListEmptyComponent={renderEmpty}
      />
      {/* Las tarjetas se desvanecen al pasar bajo la cabecera */}
      <TopFade safeArea={false} fade={22} />
      </View>

      <CreateDeck
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateDeck={() => loadData()}
      />
    </View>
  );
}
