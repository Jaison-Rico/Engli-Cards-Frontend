import React, { useCallback, useState } from 'react';
import { View, FlatList, StatusBar, RefreshControl } from 'react-native';
import { Play, Lock, Sparkles, BookOpen, Apple, Users, Briefcase, School, Plane, Palette, Dog, AlertCircle, Gamepad2, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getDecks } from '../services/decks.service';
import { getErrorMessage } from '../utils/errors';
import ListCard from '../components/ui/ListCard';
import EmptyState from '../components/ui/EmptyState';

import greetingsData from '../data/images/greetings.json';
import fruitsData from '../data/images/fruits.json';
import familyData from '../data/images/family.json';
import workData from '../data/images/work.json';
import schoolData from '../data/images/school.json';
import travelData from '../data/images/travel.json';

/** Tarjetas locales y quiz de cada lección (nombre en inglés o español). */
const LESSONS = {
  Greetings: { cards: greetingsData, quiz: 'Greetings', icon: Sparkles },
  Fruits: { cards: fruitsData, quiz: 'Fruits', icon: Apple },
  Family: { cards: familyData, quiz: 'Family', icon: Users },
  Familia: { cards: familyData, quiz: 'Family', icon: Users },
  Work: { cards: workData, quiz: 'Work', icon: Briefcase },
  Trabajo: { cards: workData, quiz: 'Work', icon: Briefcase },
  School: { cards: schoolData, quiz: 'School', icon: School },
  Escuela: { cards: schoolData, quiz: 'School', icon: School },
  Travel: { cards: travelData, quiz: 'Travel', icon: Plane },
  Viajes: { cards: travelData, quiz: 'Travel', icon: Plane },
  Colores: { icon: Palette },
  Animales: { icon: Dog },
};

export default function LearningPath() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { toast } = useFeedback();

  const [systemDecks, setSystemDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isActive = () => true) => {
    if (!userId) { setError('No se encontró tu sesión.'); setLoading(false); return; }
    setError(null);
    try {
      const data = await getDecks(userId, true);
      if (!isActive()) return;
      setSystemDecks(
        data.filter((d) => d.is_system).sort((a, b) => a.order_index - b.order_index),
      );
    } catch (err) {
      if (isActive()) setError(getErrorMessage(err, 'No se pudo cargar tu progreso.'));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => { active = false; };
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLessonPress = (item) => {
    if (item.is_locked) {
      toast.info('Lección bloqueada', { message: 'Completa la lección anterior para desbloquearla.' });
      return;
    }
    const lesson = LESSONS[item.deck_name] ?? {};
    const cards = lesson.cards?.length > 0 ? lesson.cards : (item.flashcards ?? []);
    if (cards.length > 0 || lesson.quiz) {
      navigation.navigate('GameFlashCard', {
        sampleCards: cards,
        deckId: item.deck_id,
        deckName: item.deck_name,
        quiz: lesson.quiz,
      });
    } else {
      toast.info('Este nivel aún no tiene contenido');
    }
  };

  const renderLesson = ({ item }) => {
    const isLocked = item.is_locked;
    const accuracy = Math.round((item.best_accuracy || 0) * 100);
    const isCompleted = !isLocked && item.best_accuracy >= (item.min_accuracy || 0.9);
    const Icon = LESSONS[item.deck_name]?.icon ?? BookOpen;

    return (
      <ListCard
        className={`mb-2.5 ${isLocked ? 'opacity-60' : ''}`}
        title={item.deck_name}
        onPress={() => handleLessonPress(item)}
        showChevron={false}
        accessibilityLabel={`${item.deck_name}${isLocked ? ', bloqueada' : ''}`}
        leading={(
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${isLocked ? 'bg-default' : 'bg-accent'}`}>
            <Icon size={24} color={isLocked ? theme.colors.subtle : theme.colors.onPrimary} strokeWidth={2.3} />
          </View>
        )}
        subtitle={isLocked ? 'Bloqueada' : accuracy > 0 ? `${accuracy}% de precisión` : 'Jugar ahora'}
        trailing={isLocked ? (
          <Lock size={20} color={theme.colors.subtle} />
        ) : isCompleted ? (
          <CheckCircle2 size={24} color={theme.colors.success} />
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/10">
            <Play size={16} color={theme.colors.primary} fill={theme.colors.primary} />
          </View>
        )}
      />
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <FlatList
        data={loading ? [] : systemDecks}
        keyExtractor={(item) => String(item.deck_id)}
        renderItem={renderLesson}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
        ListHeaderComponent={(
          <View className="px-1 pb-5 pt-2">
            <Typography type="h3" weight="bold" className="tracking-tight">Juegos</Typography>
            <Typography type="body-sm" color="muted" className="mt-0.5">Aprende palabras divirtiéndote</Typography>
          </View>
        )}
        ListEmptyComponent={() => {
          if (loading) return <View className="items-center py-12"><Spinner size="lg" /></View>;
          if (error) {
            return (
              <EmptyState
                icon={AlertCircle}
                tone="danger"
                title="No pudimos cargar los juegos"
                description={error}
                actionLabel="Reintentar"
                onAction={() => { setLoading(true); load(); }}
              />
            );
          }
          return <EmptyState icon={Gamepad2} title="Sin juegos disponibles" description="Vuelve más tarde para nuevas lecciones." />;
        }}
      />
    </View>
  );
}
