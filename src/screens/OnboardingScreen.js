import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StatusBar, Image, Text } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { getCategories, completeOnboarding } from '../services/onboarding.service';
import { getUserId } from '../context/AuthContext';
import { Button, Card, Spinner, Typography } from 'heroui-native';

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

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

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
    } catch {
      alert('Hubo un error al configurar tu cuenta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = selected.size > 0;

  const renderCategory = ({ item }) => {
    const isSelected = selected.has(item.key);
    return (
      <Card
        className={`w-[48%] mb-3 border-2 ${isSelected ? 'border-accent' : 'border-transparent'}`}
        onPress={() => toggleCategory(item.key)}
        animation="disable-all"
      >
        <Card.Body className="p-4 relative">
          {isSelected && (
            <View className="absolute top-2.5 right-2.5 z-10">
              <CheckCircle2 size={18} color={theme.colors.primary} />
            </View>
          )}
          {CATEGORY_GIFS[item.key] ? (
            <Image
              source={{ uri: CATEGORY_GIFS[item.key] }}
              style={{ width: 56, height: 56, borderRadius: 8, marginBottom: 8 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</Text>
          )}
          <Typography
            type="body"
            weight="bold"
            className={`mb-1 ${isSelected ? 'text-accent' : 'text-foreground'}`}
          >
            {item.name}
          </Typography>
          <Typography type="body-xs" color="muted">{item.description}</Typography>
        </Card.Body>
      </Card>
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
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          renderItem={renderCategory}
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
