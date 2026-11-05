import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StatusBar, Text } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getCategories, completeOnboarding } from '../services/onboarding.service';
import { getErrorMessage } from '../utils/errors';
import { Button, Spinner, Typography } from 'heroui-native';
import CachedImage from '../components/CachedImage';
import PressableScale from '../components/ui/PressableScale';
import EmptyState from '../components/ui/EmptyState';
import { elevation } from '../theme/theme';

const CATEGORY_GIFS = {
  saludos: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjR3aG9oZzNqZnluNjBteGplaWxkb3hxamN6bGdvd2o1dHk0dzNmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IThjAlJnD9WNO/giphy.gif',
  viajes: null,
  trabajo: null,
  familia: null,
  escuela: null,
  frutas: null,
  comida: null,
  colores: null,
};

export default function OnboardingScreen() {
  const { theme } = useAppTheme();
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { toast } = useFeedback();

  const loadCategories = useCallback(() => {
    setLoadingCategories(true);
    setLoadError(null);
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => setLoadError(getErrorMessage(err, 'No se pudieron cargar los temas.')))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const toggleCategory = useCallback((key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleContinue = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      await completeOnboarding(Array.from(selected));
      await updateUser({ onboarding_completed: true });
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs' }] }));
    } catch (err) {
      toast.error('No pudimos configurar tu cuenta', { message: getErrorMessage(err, 'Intenta de nuevo.') });
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = selected.size > 0;

  const renderCategory = ({ item }) => {
    const isSelected = selected.has(item.key);
    return (
      <PressableScale
        style={{ width: '48%', marginBottom: 12 }}
        onPress={() => toggleCategory(item.key)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={item.name}
      >
        <View
          className={`w-full rounded-3xl ${isSelected ? 'bg-accent/5' : 'bg-surface'}`}
          style={{
            height: 180,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            ...elevation(isSelected ? 2 : 1, theme.mode),
          }}
        >
          <View className="relative flex-1 justify-between p-4">
            {isSelected && (
              <View className="absolute top-3 right-3 z-10">
                <CheckCircle2 size={20} color={theme.colors.primary} />
              </View>
            )}

            {/* Contenedor de icono/GIF con altura fija para alineación perfecta */}
            <View style={{ height: 56, justifyContent: 'center' }}>
              {CATEGORY_GIFS[item.key] ? (
                <CachedImage
                  uri={CATEGORY_GIFS[item.key]}
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <Text style={{ fontSize: 38 }}>{item.emoji}</Text>
              )}
            </View>

            {/* Contenedor de textos alineados */}
            <View>
              <Typography
                type="body"
                weight="bold"
                style={{
                  color: isSelected ? theme.colors.primary : undefined,
                  marginBottom: 4,
                }}
              >
                {item.name}
              </Typography>
              <Typography
                type="body-xs"
                color="muted"
                numberOfLines={2}
                style={{ lineHeight: 16 }}
              >
                {item.description}
              </Typography>
            </View>
          </View>
        </View>
      </PressableScale>
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Typography type="h2" weight="bold" className="mb-2">¿Qué quieres aprender?</Typography>
        <Typography type="body-sm" color="muted" className="leading-5">
          Elige los temas que te interesan y crearemos mazos personalizados para ti
        </Typography>
      </View>

      {loadingCategories ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" />
        </View>
      ) : loadError ? (
        <View className="flex-1 justify-center">
          <EmptyState icon={AlertCircle} tone="danger" title="No pudimos cargar los temas" description={loadError} actionLabel="Reintentar" onAction={loadCategories} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          renderItem={renderCategory}
          extraData={Array.from(selected)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <View
        className="px-6 pt-2 bg-background border-t border-border"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {selected.size > 0 && (
          <Typography type="body-xs" color="muted" align="center" className="mb-2">
            {selected.size} {selected.size === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
          </Typography>
        )}
        <Button
          size="lg"
          className="w-full rounded-full h-[52px]"
          onPress={handleContinue}
          isDisabled={!canContinue || submitting}
        >
          {submitting
            ? <Spinner color="white" size="sm" />
            : <Button.Label>{canContinue ? 'Comenzar a aprender' : 'Selecciona al menos uno'}</Button.Label>
          }
        </Button>
      </View>
    </View>
  );
}
