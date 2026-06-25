import React, { useState } from 'react';
import { View, FlatList, Alert, StatusBar } from 'react-native';
import { Play, Lock, Sparkles, BookOpen, Apple, Users, Briefcase, School, Plane, Palette, Dog } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, getUserId } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { getDecks } from '../services/decks.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Spinner, Typography } from 'heroui-native';

import greetingsData from '../data/images/greetings.json';
import FruitsData from '../data/images/fruits.json';
import familyData from '../data/images/family.json';
import workData from '../data/images/work.json';
import schoolData from '../data/images/school.json';
import travelData from '../data/images/travel.json';

const localData = {
  Greetings: greetingsData,
  Fruits: FruitsData,
  Family: familyData,
  Familia: familyData,
  Work: workData,
  Trabajo: workData,
  School: schoolData,
  Escuela: schoolData,
  Travel: travelData,
  Viajes: travelData,
};

const quizScreens = {
  Greetings: 'Greetings',
  Fruits: 'Fruits',
  Family: 'Family',
  Familia: 'Family',
  Work: 'Work',
  Trabajo: 'Work',
  School: 'School',
  Escuela: 'School',
  Travel: 'Travel',
  Viajes: 'Travel',
};

const ICON_MAP = {
  Sparkles, Apple, Users, Briefcase, School, Plane, Palette, Dog, BookOpen,
};

function getIconName(name) {
  switch (name) {
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
}

export default function LearningPath() {
  const { theme } = useAppTheme();
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
        if (!userId) { setError('No se encontró el ID de usuario.'); return; }
        setLoading(true);
        setError(null);
        try {
          const data = await getDecks(userId, true);
          if (isActive) {
            const normalized = data
              .filter((d) => d.is_system)
              .map((d) => ({ ...d, iconName: getIconName(d.deck_name) }))
              .sort((a, b) => a.order_index - b.order_index);
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

  const handleLessonPress = (item) => {
    if (item.is_locked) return;
    const deckName = item.deck_name;
    const localCards = localData[deckName];
    const cards = localCards?.length > 0 ? localCards : (item.flashcards?.length > 0 ? item.flashcards : []);
    const quiz = quizScreens[deckName];
    if (cards.length > 0 || quiz) {
      navigation.navigate('GameFlashCard', {
        sampleCards: cards || [],
        deckId: item.deck_id,
        deckName,
        quiz,
      });
    } else {
      Alert.alert('Mazo vacío', 'Este nivel aún no tiene contenido.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 20 }}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      <FlatList
        data={systemDecks}
        keyExtractor={(item) => item.deck_id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="px-2 pt-2 pb-6">
            <Typography type="h2" weight="bold" className="mb-1">Juegos</Typography>
            <Typography type="body-sm" color="muted">Aprende palabras divirtiéndote</Typography>
          </View>
        )}
        renderItem={({ item }) => {
          const isLocked = item.is_locked;
          const IconComp = ICON_MAP[item.iconName] || BookOpen;
          return (
            <Card
              className={`mb-3 ${isLocked ? 'opacity-60' : ''}`}
              onPress={() => handleLessonPress(item)}
              animation={isLocked ? 'disable-all' : undefined}
            >
              <Card.Body className="flex-row items-center px-4 py-4 gap-4">
                {/* Icon */}
                <View
                  className={`w-14 h-14 rounded-2xl items-center justify-center ${
                    isLocked ? 'bg-default' : 'bg-accent'
                  }`}
                >
                  <IconComp
                    size={28}
                    color={isLocked ? theme.colors.mutedForeground : '#ffffff'}
                    strokeWidth={2.5}
                  />
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Typography type="body" weight="bold" className={isLocked ? 'text-muted' : 'text-foreground'}>
                    {item.deck_name}
                  </Typography>
                  {!isLocked && item.best_accuracy > 0 ? (
                    <View className="mt-1.5">
                      <View className="h-1.5 bg-default rounded-full overflow-hidden">
                        <View
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${Math.round(item.best_accuracy * 100)}%` }}
                        />
                      </View>
                      <Typography type="body-xs" color="muted" className="mt-0.5">
                        {Math.round(item.best_accuracy * 100)}% precisión
                      </Typography>
                    </View>
                  ) : (
                    <Typography type="body-xs" color="muted">
                      {isLocked ? 'Bloqueado' : 'Jugar ahora'}
                    </Typography>
                  )}
                </View>

                {/* Action Icon */}
                {isLocked ? (
                  <Lock size={22} color={theme.colors.mutedForeground} strokeWidth={2.5} />
                ) : (
                  <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
                    <Play size={18} color="#ffffff" fill="#ffffff" strokeWidth={2.5} />
                  </View>
                )}
              </Card.Body>
            </Card>
          );
        }}
        ListEmptyComponent={() => (
          <View className="items-center px-6 mt-10">
            <Typography type="body-sm" color="muted" align="center">
              {error ? `Error: ${error}` : 'No se encontraron juegos disponibles.'}
            </Typography>
          </View>
        )}
      />
    </View>
  );
}
