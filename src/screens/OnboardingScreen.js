import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { getCategories, completeOnboarding } from '../services/onboarding.service';
import { getUserId } from '../context/AuthContext';

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
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs' }] }),
      );
    } catch {
      alert('Hubo un error al configurar tu cuenta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = getStyles(theme);

  const renderCategory = ({ item }) => {
    const isSelected = selected.has(item.key);
    return (
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={() => toggleCategory(item.key)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <View style={styles.checkBadge}>
            <CheckCircle2 size={18} color={theme.colors.primary} />
          </View>
        )}
        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
        <Text style={[styles.categoryName, isSelected && { color: theme.colors.primary }]}>
          {item.name}
        </Text>
        <Text style={styles.categoryDesc}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  const canContinue = selected.size > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <Text style={styles.title}>¿Qué quieres aprender?</Text>
        <Text style={styles.subtitle}>
          Elige los temas que te interesan y crearemos mazos personalizados para ti
        </Text>
      </View>

      {loadingCategories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          renderItem={renderCategory}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {selected.size > 0 && (
          <Text style={styles.selectionHint}>
            {selected.size} {selected.size === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueBtnText}>
              {canContinue ? 'Comenzar a aprender' : 'Selecciona al menos uno'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.foreground,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.mutedForeground,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    row: {
      justifyContent: 'space-between',
    },
    categoryCard: {
      width: '48%',
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.foreground,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    categoryCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.card,
    },
    checkBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    categoryEmoji: {
      fontSize: 36,
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.foreground,
      marginBottom: 4,
    },
    categoryDesc: {
      fontSize: 11,
      color: theme.colors.mutedForeground,
      lineHeight: 15,
    },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 8,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    selectionHint: {
      fontSize: 12,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: 8,
    },
    continueBtn: {
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        android: { elevation: 8 },
      }),
    },
    continueBtnDisabled: {
      backgroundColor: theme.colors.muted,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#ffffff',
    },
  });
