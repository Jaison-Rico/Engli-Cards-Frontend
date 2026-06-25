import React, { useState } from 'react';
import { View, FlatList, StatusBar, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BookOpen, Activity, Plus, Flame } from 'lucide-react-native';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';
import * as Haptics from 'expo-haptics';
import SoundManager from '../config/sounds';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth, getUserId } from '../context/AuthContext';
import { getDecks } from '../services/decks.service';
import { getUserStats } from '../services/users.service';
import CreateDeck from '../components/CreateDeckModal';

export default function MainScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [decks, setDecks] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [streak, setStreak] = useState(0);

  const handleDeckCreated = () => setRefreshKey((prev) => prev + 1);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (!userId) {
          setError('No se encontró el ID de usuario. Inicia sesión nuevamente.');
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const [deckData, stats] = await Promise.all([
            getDecks(userId, false),
            getUserStats(userId).catch(() => null),
          ]);
          if (isActive) {
            setDecks(deckData);
            setIsOffline(false);
            if (stats) setStreak(stats.streak_current || 0);
          }
        } catch (err) {
          if (isActive) {
            setError(err?.response?.data?.message || err?.message || 'Error inesperado');
            setIsOffline(true);
            setDecks([]);
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchData();
      return () => { isActive = false; };
    }, [userId, refreshKey])
  );

  const personalDecks = decks.filter((d) => !d.is_system);

  return (
    <View className="flex-1 bg-background">
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Top Section */}
      <View className="bg-surface px-5 pb-4 shadow-surface" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-3">
            <Typography type="h2" weight="bold">Engli cards</Typography>
            <Typography type="body-sm" color="muted">
              ¡Hola! {user?.name?.split(' ')[0] || 'amigo'} Continúa aprendiendo
            </Typography>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center bg-default px-3 py-1.5 rounded-full gap-1">
              <Flame color="#F97316" size={20} fill="#F97316" />
              <Typography type="body-sm" weight="bold" className="text-[#C2410C]">{streak}</Typography>
            </View>

            <Button
              variant="secondary"
              size="sm"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.push('StatsScreen');
              }}
            >
              <Activity color="#08302E" size={16} strokeWidth={2.5} />
              <Button.Label className="text-foreground">Stats</Button.Label>
            </Button>
          </View>
        </View>

        <View className="flex-row items-center bg-background-secondary rounded-xl px-4 h-11 gap-2">
          <Input
            className="flex-1 bg-transparent"
            placeholder="Nombre del deck"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row px-4 py-3 gap-3">
        <Button
          variant="secondary"
          className="flex-1 h-[72px] rounded-2xl"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            SoundManager.play('click');
            setModalVisible(true);
          }}
        >
          <Plus color="#08302E" size={30} strokeWidth={2} />
          <Button.Label className="text-foreground text-base font-bold">+ Crear Deck</Button.Label>
        </Button>

        <Button
          variant="secondary"
          className="flex-1 h-[72px] rounded-2xl"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            SoundManager.play('click');
            navigation.push('NewFlashCard');
          }}
        >
          <BookOpen color="#08302E" size={28} strokeWidth={2} />
          <Button.Label className="text-foreground text-base font-bold">Crear Flashcard</Button.Label>
        </Button>
      </View>

      {/* Deck List */}
      <View className="flex-1 px-4">
        {isOffline && (
          <Typography type="body-sm" className="text-warning text-center my-2">
            Modo offline — sin conexión al servidor
          </Typography>
        )}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Spinner size="lg" />
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={personalDecks.filter((d) =>
              d.deck_name?.toLowerCase().includes(search.toLowerCase())
            )}
            keyExtractor={(item, index) =>
              item.deck_id ? String(item.deck_id) : `${item.deck_name || 'deck'}-${index}`
            }
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <Typography type="h5" weight="bold" className="mt-2 mb-4">Mis Mazos</Typography>
            )}
            renderItem={({ item }) => (
              <Card
                className="mb-2"
                onPress={() => navigation.navigate('DeckDetails', { deck: item })}
              >
                <Card.Body className="flex-row items-center justify-between py-2.5 px-4">
                  <View className="flex-1">
                    <Typography type="body" weight="semibold">{item.deck_name}</Typography>
                    <Typography type="body-sm" color="muted">{item.cardCount ?? 0} tarjetas</Typography>
                  </View>
                  <Button
                    isIconOnly
                    variant="primary"
                    size="sm"
                    className="rounded-xl"
                    onPress={() => {
                      if (item.flashcards && item.flashcards.length > 0) {
                        navigation.navigate('GameFlashCard', {
                          sampleCards: item.flashcards,
                          deckId: item.deck_id,
                          deckName: item.deck_name,
                        });
                      } else {
                        Alert.alert('Mazo vacío', 'Agrega algunas flashcards antes de estudiar.');
                      }
                    }}
                  >
                    <BookOpen size={18} color="#ffffff" strokeWidth={2.5} />
                  </Button>
                </Card.Body>
              </Card>
            )}
            ListEmptyComponent={() => (
              <Typography type="body" color="muted" align="center" className="my-5">
                {error ? `Error: ${error}` : 'No tienes mazos personales aún'}
              </Typography>
            )}
            contentContainerStyle={
              personalDecks.length === 0 ? { flexGrow: 1 } : { paddingBottom: 40 }
            }
          />
        )}
      </View>

      <CreateDeck
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateDeck={handleDeckCreated}
      />
    </View>
  );
}
