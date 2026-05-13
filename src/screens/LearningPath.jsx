import { useAppTheme } from '../context/ThemeContext';
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StatusBar } from "react-native";
import { Play, Lock, Sparkles, BookOpen, Apple, Users, Briefcase, School, Plane, Palette, Dog } from "lucide-react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import get_stylesLP from '../styles/stylesLearningPath';

// Fallback data
import greetingsData from './games/imagesGreetings.json';
import FruitsData from './games/imagesFruits.json';
import familyData from './games/imagesFamily.json';
import workData from './games/imagesWork.json';
import schoolData from './games/imagesSchool.json';
import travelData from './games/imagesTravel.json';

const localData = {
  'Greetings': greetingsData,
  'Fruits': FruitsData,
  'Family': familyData,
  'Familia': familyData,
  'Work': workData,
  'Trabajo': workData,
  'School': schoolData,
  'Escuela': schoolData,
  'Travel': travelData,
  'Viajes': travelData,
};

export default function LearningPath() {
  const { theme } = useAppTheme();
  const stylesLP = get_stylesLP(theme);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [systemDecks, setSystemDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchSystemDecks = async () => {
        setLoading(true);
        setError(null);
        try {
          let user = null;
          const storedUser = await SecureStore.getItemAsync('userInfo');
          if (storedUser) user = JSON.parse(storedUser);

          const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
          if (!userId) {
            if (isActive) setError('No se encontró el ID de usuario.');
            return;
          }

          const token = await SecureStore.getItemAsync('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

          const url = `${config.BASE_URL}/decks/${userId}`;
          const resp = await axios.get(url, { headers });
          const data = Array.isArray(resp.data) ? resp.data : (resp.data?.decks ?? []);

          if (isActive) {
            const normalized = data.filter(d => d.is_system).map((d) => ({
              deck_id: d.deck_id ?? d.id ?? d._id ?? d.deckId ?? String(Math.random()),
              deck_name: d.deck_name ?? d.name ?? d.title ?? 'Deck',
              cardCount: d.cardCount ?? d.cardsCount ?? (Array.isArray(d.flashcards) ? d.flashcards.length : (Array.isArray(d.cards) ? d.cards.length : 0)),
              flashcards: d.flashcards,
              is_system: d.is_system ?? false,
              order_index: d.order_index ?? 0,
              is_locked: d.is_locked ?? false,
              best_accuracy: d.best_accuracy ?? 0,
              min_accuracy: d.min_accuracy ?? 0.9,
              icon: getIconForDeck(d.deck_name)
            })).sort((a, b) => a.order_index - b.order_index);

            setSystemDecks(normalized);
          }
        } catch (err) {
          if (isActive) setError(err?.response?.data?.message || err?.message || 'Error al cargar el progreso');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchSystemDecks();
      return () => { isActive = false; };
    }, [])
  );

  const getIconForDeck = (name) => {
    switch(name) {
      case 'Greetings': return 'Sparkles';
      case 'Fruits': return 'Apple';
      case 'Family':
      case 'Familia': return 'Users';
      case 'Work':
      case 'Trabajo': return 'Briefcase';
      case 'School':
      case 'Escuela': return 'School';
      case 'Travel':
      case 'Viajes': return 'Plane';
      case 'Colores': return 'Palette';
      case 'Animales': return 'Dog';
      default: return 'BookOpen';
    }
  };

  const renderIcon = (iconName, color) => {
    const props = { size: 30, color, strokeWidth: 2.5 };
    switch(iconName) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Apple': return <Apple {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'School': return <School {...props} />;
      case 'Plane': return <Plane {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'Dog': return <Dog {...props} />;
      default: return <BookOpen {...props} />;
    }
  };

  const quizScreens = {
    'Greetings': 'Greetings',
    'Fruits': 'Fruits',
    'Family': 'Family',
    'Familia': 'Family',
    'Work': 'Work',
    'Trabajo': 'Work',
    'School': 'School',
    'Escuela': 'School',
    'Travel': 'Travel',
    'Viajes': 'Travel'
  };

  const handleLessonPress = (item) => {
    if (item.is_locked) return;
    
    // Usar datos locales si el backend no tiene flashcards
    const deckName = item.deck_name;
    const cards = (item.flashcards && item.flashcards.length > 0) ? item.flashcards : localData[deckName];
    const quiz = quizScreens[deckName];

    if ((cards && cards.length > 0) || quiz) {
      navigation.navigate("GameFlashCard", {
        sampleCards: cards || [],
        deckId: item.deck_id,
        deckName: deckName,
        quiz: quiz
      });
    } else {
      Alert.alert("Mazo vacío", "Este nivel aún no tiene contenido.");
    }
  };

  if (loading) {
    return (
      <View style={[stylesLP.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + 20 }}>
      <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} />
      
      <FlatList
        data={systemDecks}
        keyExtractor={(item) => item.deck_id.toString()}
        contentContainerStyle={stylesLP.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={stylesLP.headerContainer}>
            <Text style={stylesLP.headerTitle}>Juegos</Text>
            <Text style={stylesLP.headerSubtitle}>Aprende palabras divirtiéndote</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isLocked = item.is_locked;
          
          return (
            <TouchableOpacity 
              onPress={() => handleLessonPress(item)}
              disabled={isLocked}
              activeOpacity={0.8}
              style={[
                stylesLP.cardContainer,
                isLocked && stylesLP.cardLocked
              ]}
            >
              <View style={[
                stylesLP.iconContainer, 
                isLocked ? stylesLP.iconLocked : stylesLP.iconAvailable
              ]}>
                {renderIcon(item.icon, isLocked ? theme.colors.mutedForeground : theme.colors.primary)}
              </View>

              <View style={stylesLP.textContainer}>
                <Text style={[
                  stylesLP.cardTitle,
                  isLocked && stylesLP.cardTitleLocked
                ]}>
                  {item.deck_name}
                </Text>
                <Text style={[
                  stylesLP.cardStatus,
                  isLocked && stylesLP.cardStatusLocked
                ]}>
                  {isLocked ? "Bloqueado" : "Jugar ahora"}
                </Text>
              </View>

              {isLocked ? (
                <View style={stylesLP.lockIconContainer}>
                  <Lock size={22} color={theme.colors.mutedForeground} strokeWidth={2.5} />
                </View>
              ) : (
                <View style={stylesLP.playButton}>
                  <Play size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.mutedForeground }}>
              {error ? `Error: ${error}` : 'No se encontraron juegos disponibles.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
