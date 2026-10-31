import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StatusBar, Image, Text, TouchableOpacity } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { getCategories, completeOnboarding } from '../services/onboarding.service';
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
    } catch (err) {
      console.log('Error completing onboarding:', err);
      alert('Hubo un error al configurar tu cuenta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = selected.size > 0;

  const renderCategory = ({ item }) => {
    const isSelected = selected.has(item.key);
    return (
      <TouchableOpacity
        style={{ width: '48%', marginBottom: 12 }}
        activeOpacity={0.7}
        onPress={() => toggleCategory(item.key)}
      >
        <Card
          className="w-full"
          style={{
            height: 180,
            borderWidth: 2,
            borderColor: isSelected ? theme.colors.primary : 'transparent',
            borderRadius: 20,
          }}
          animation="disable-all"
        >
          <Card.Body className="p-4 relative flex-1 justify-between">
            {isSelected && (
              <View className="absolute top-3 right-3 z-10">
                <CheckCircle2 size={20} color={theme.colors.primary} />
              </View>
            )}

            {/* Contenedor de icono/GIF con altura fija para alineación perfecta */}
            <View style={{ height: 56, justifyContent: 'center' }}>
              {CATEGORY_GIFS[item.key] ? (
                <Image
                  source={{ uri: CATEGORY_GIFS[item.key] }}
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                  resizeMode="cover"
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
          </Card.Body>
        </Card>
      </TouchableOpacity>
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
