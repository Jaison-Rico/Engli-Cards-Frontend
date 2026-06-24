import { useAppTheme } from '../context/ThemeContext';
import { useAuth, getUserId } from '../context/AuthContext';
import get_stylesMS from '../styles/mainScreen.styles';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { BookOpen, Activity, Plus, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import SoundManager from '../config/sounds';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDecks } from '../services/decks.service';
import { getUserStats } from '../services/users.service';
import CreateDeck from '../components/CreateDeckModal';

export default function MainScreen() {
  const { theme } = useAppTheme();
  const stylesMS = get_stylesMS(theme);
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [decks, setDecks] = useState([]);
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={{ ...stylesMS.containerMCTop, paddingTop: insets.top + 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={stylesMS.titlesMC}>Engli cards</Text>
            <Text style={stylesMS.subtitlesMC}>
              ¡Hola! {user?.name?.split(' ')[0] || 'amigo'} Continúa aprendiendo
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceContainerLow || '#E8F5F0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Flame color="#F97316" size={20} fill="#F97316" />
              <Text style={{ marginLeft: 4, fontWeight: '800', color: '#C2410C' }}>{streak}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.push('StatsScreen');
              }}
              style={stylesMS.buttonStats}
            >
              <Activity color="#08302E" size={18} strokeWidth={2.5} />
              <Text style={stylesMS.textButtonMCStats}>Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={stylesMS.searchContainerTop}>
          <TextInput
            style={stylesMS.searchInputTop}
            placeholder="Nombre del deck"
            placeholderTextColor="#A1CFC9"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={stylesMS.containerMCBottonsMain}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            SoundManager.play('click');
            setModalVisible(true);
          }}
          style={stylesMS.buttonCDeck}
          activeOpacity={0.8}
        >
          <Plus color="#08302E" size={32} strokeWidth={2} />
          <Text style={stylesMS.buttonCardText}>Crear Deck</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            SoundManager.play('click');
            navigation.push('NewFlashCard');
          }}
          style={stylesMS.buttonCFlashcard}
          activeOpacity={0.8}
        >
          <BookOpen color="#08302E" size={30} strokeWidth={2} />
          <Text style={stylesMS.buttonCardText}>Crear Flashcard</Text>
        </TouchableOpacity>
      </View>

      <View style={stylesMS.deckListContainer}>
        {isOffline && (
          <Text style={{ margin: 10, textAlign: 'center', color: 'orange' }}>
            Modo offline — sin conexión al servidor
          </Text>
        )}
        {loading ? (
          <ActivityIndicator size="large" color="#12B5B0" />
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
              <Text style={[stylesMS.misMazosTitle, { marginLeft: 0, marginTop: 10, marginBottom: 16 }]}>
                Mis Mazos
              </Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={stylesMS.deckCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DeckDetails', { deck: item })}
              >
                <View style={stylesMS.deckCardLeft}>
                  <Text style={stylesMS.deckTitle}>{item.deck_name}</Text>
                  <Text style={stylesMS.deckCount}>{item.cardCount ?? 0} tarjetas</Text>
                </View>
                <TouchableOpacity
                  style={stylesMS.deckCardRight}
                  onPress={(e) => {
                    e.stopPropagation();
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
                  <BookOpen size={20} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={{ margin: 20, textAlign: 'center', color: '#527F7C' }}>
                {error ? `Error: ${error}` : 'No tienes mazos personales aún'}
              </Text>
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
