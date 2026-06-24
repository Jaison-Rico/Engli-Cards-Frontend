import { useAppTheme } from '../context/ThemeContext';
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StatusBar } from "react-native";
import { Play, Lock, Sparkles, BookOpen, Apple, Users, Briefcase, School, Plane, Palette, Dog } from "lucide-react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, getUserId } from '../context/AuthContext';
import { getDecks } from '../services/decks.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import get_stylesLP from '../styles/learningPath.styles';

// Fallback data
import greetingsData from '../data/images/greetings.json';
import FruitsData from '../data/images/fruits.json';
import familyData from '../data/images/family.json';
import workData from '../data/images/work.json';
import schoolData from '../data/images/school.json';
import travelData from '../data/images/travel.json';

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
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [systemDecks, setSystemDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchSystemDecks = async () => {
        if (!userId) {
          setError('No se encontró el ID de usuario.');
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const data = await getDecks(userId, true);
          if (isActive) {
            const systemDecksNormalized = data
              .filter((d) => d.is_system)
              .map((d) => ({ ...d, icon: getIconForDeck(d.deck_name) }))
              .sort((a, b) => a.order_index - b.order_index);
            setSystemDecks(systemDecksNormalized);
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
    
    // Para mazos de juego del learning path, priorizar data local fija.
    // Si existe data local (ej. imagesFruits.json), no debe ser reemplazada por
    // tarjetas sueltas creadas por el usuario en el backend.
    const deckName = item.deck_name;
    const localCards = localData[deckName];
    const cards = (localCards && localCards.length > 0)
      ? localCards
      : ((item.flashcards && item.flashcards.length > 0) ? item.flashcards : []);
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
              style={[stylesLP.cardContainer, isLocked && stylesLP.cardLocked]}
            >
              <View style={[
                stylesLP.iconContainer,
                isLocked ? stylesLP.iconLocked : stylesLP.iconAvailable,
              ]}>
                {renderIcon(item.icon, isLocked ? theme.colors.mutedForeground : '#FFFFFF')}
              </View>

              <View style={stylesLP.textContainer}>
                <Text style={[stylesLP.cardTitle, isLocked && stylesLP.cardTitleLocked]}>
                  {item.deck_name}
                </Text>

                {/* Barra de progreso — solo si hay precisión registrada */}
                {!isLocked && item.best_accuracy > 0 ? (
                  <View style={{ marginTop: 6 }}>
                    <View style={stylesLP.progressBarBg}>
                      <View
                        style={[
                          stylesLP.progressBarFill,
                          { width: `${Math.round(item.best_accuracy * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={[stylesLP.cardStatus, { marginTop: 3, fontSize: 12 }]}>
                      {Math.round(item.best_accuracy * 100)}% precisión
                    </Text>
                  </View>
                ) : (
                  <Text style={[stylesLP.cardStatus, isLocked && stylesLP.cardStatusLocked]}>
                    {isLocked ? "Bloqueado" : "Jugar ahora"}
                  </Text>
                )}
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
