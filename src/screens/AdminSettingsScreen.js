import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { Plus, Pencil, Trash2, Shield, X, Save, AlertCircle, BookOpen } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth, getUserId } from '../context/AuthContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getSystemLessons, saveSystemLesson, deleteSystemLesson } from '../services/admin.service';
import { getErrorMessage } from '../utils/errors';
import ScreenHeader from '../components/ui/ScreenHeader';
import ListCard from '../components/ui/ListCard';
import IconButton from '../components/ui/IconButton';
import EmptyState from '../components/ui/EmptyState';
import FormField from '../components/ui/FormField';

export default function AdminSettingsScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = getUserId(user);
  const { toast, confirm } = useFeedback();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formName, setFormName] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [formAccuracy, setFormAccuracy] = useState('0.9');
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoadError(null);
    try {
      setLessons(await getSystemLessons());
    } catch (error) {
      setLoadError(getErrorMessage(error, 'No se pudieron cargar las lecciones.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const openModal = (lesson = null) => {
    setEditingLesson(lesson);
    setFormName(lesson ? lesson.deck_name : '');
    setFormOrder(String(lesson ? lesson.order_index : lessons.length + 1));
    setFormAccuracy(String(lesson ? lesson.min_accuracy : 0.9));
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const orderIndex = parseInt(formOrder, 10);
    const minAccuracy = parseFloat(formAccuracy);
    if (!formName.trim() || Number.isNaN(orderIndex)) {
      setFormError('El nombre y el orden son obligatorios.');
      return;
    }
    if (Number.isNaN(minAccuracy) || minAccuracy < 0 || minAccuracy > 1) {
      setFormError('La precisión mínima debe estar entre 0 y 1.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await saveSystemLesson(userId, {
        deckId: editingLesson?.deck_id,
        name: formName.trim(),
        orderIndex,
        minAccuracy,
      });
      setModalVisible(false);
      toast.success(editingLesson ? 'Lección actualizada' : 'Lección creada');
      fetchLessons();
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo guardar la lección.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson) => {
    const ok = await confirm({
      title: '¿Eliminar lección?',
      message: `Se eliminará “${lesson.deck_name}” y todas sus flashcards asociadas.`,
      confirmText: 'Eliminar',
      destructive: true,
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await deleteSystemLesson(userId, lesson.deck_id);
      toast.success('Lección eliminada');
      fetchLessons();
    } catch (error) {
      toast.error('No se pudo eliminar la lección', { message: getErrorMessage(error) });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Administración" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6 flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Shield color={theme.colors.primary} size={22} />
          </View>
          <View className="flex-1">
            <Typography type="body" weight="bold">Gestión de lecciones</Typography>
            <Typography type="body-xs" color="muted" className="mt-0.5 leading-4">
              El orden determina la secuencia de desbloqueo de la ruta de aprendizaje.
            </Typography>
          </View>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Typography type="h6" weight="bold">Lecciones actuales</Typography>
          <Button size="sm" onPress={() => openModal()}>
            <Plus color={theme.colors.onPrimary} size={16} />
            <Button.Label>Nueva</Button.Label>
          </Button>
        </View>

        {loading ? (
          <View className="mt-10 items-center"><Spinner size="lg" /></View>
        ) : loadError ? (
          <EmptyState icon={AlertCircle} tone="danger" title="Error al cargar" description={loadError} actionLabel="Reintentar" onAction={() => { setLoading(true); fetchLessons(); }} />
        ) : lessons.length === 0 ? (
          <EmptyState icon={BookOpen} title="No hay lecciones configuradas" actionLabel="Crear lección" onAction={() => openModal()} />
        ) : (
          lessons.map((item) => (
            <ListCard
              key={item.deck_id}
              className="mb-2.5"
              title={item.deck_name}
              subtitle={`Precisión mínima: ${(item.min_accuracy * 100).toFixed(0)}%`}
              onPress={() => navigation.navigate('DeckDetails', { deck: item })}
              showChevron={false}
              leading={(
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <Typography type="body" weight="bold" className="text-accent">{item.order_index}</Typography>
                </View>
              )}
              trailing={(
                <View className="flex-row">
                  <IconButton accessibilityLabel={`Editar ${item.deck_name}`} onPress={() => openModal(item)}>
                    <Pencil color={theme.colors.muted} size={18} />
                  </IconButton>
                  <IconButton accessibilityLabel={`Eliminar ${item.deck_name}`} onPress={() => handleDelete(item)}>
                    <Trash2 color={theme.colors.danger} size={18} />
                  </IconButton>
                </View>
              )}
            />
          ))
        )}
      </ScrollView>

      {/* Hoja para crear/editar */}
      <Modal visible={modalVisible} animationType="fade" transparent statusBarTranslucent onRequestClose={() => !saving && setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end"
          style={{ backgroundColor: theme.colors.backdrop }}
        >
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => !saving && setModalVisible(false)} />
          <Animated.View
            entering={SlideInDown.springify().damping(22).stiffness(240)}
            className="rounded-t-3xl border-t border-border bg-overlay px-5 pt-2"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-3 mt-1 h-1 w-10 self-center rounded-full bg-border" />
            <View className="mb-5 flex-row items-center justify-between">
              <Typography type="h5" weight="bold">{editingLesson ? 'Editar lección' : 'Nueva lección'}</Typography>
              <IconButton accessibilityLabel="Cerrar" onPress={() => setModalVisible(false)} disabled={saving}>
                <X color={theme.colors.muted} size={20} />
              </IconButton>
            </View>

            <FormField label="Nombre de la lección" value={formName} onChangeText={setFormName} placeholder="Ej. Greetings" editable={!saving} />
            <View className="flex-row gap-3">
              <FormField className="flex-1" label="Orden" value={formOrder} onChangeText={setFormOrder} placeholder="1" keyboardType="number-pad" editable={!saving} />
              <FormField className="flex-1" label="Precisión mín. (0-1)" value={formAccuracy} onChangeText={setFormAccuracy} placeholder="0.9" keyboardType="decimal-pad" editable={!saving} />
            </View>
            {formError ? <Typography type="body-sm" className="mb-3 text-danger">{formError}</Typography> : null}

            <Button size="lg" className="mt-1 w-full" onPress={handleSave} isDisabled={saving}>
              {saving ? <Spinner color={theme.colors.onPrimary} size="sm" /> : (
                <>
                  <Save color={theme.colors.onPrimary} size={18} />
                  <Button.Label>Guardar lección</Button.Label>
                </>
              )}
            </Button>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
