import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Edit3, Trash2, Shield, X, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';
import { useAppTheme } from '../context/ThemeContext';
import { Button, Card, Input, Spinner, Typography } from 'heroui-native';

export default function AdminSettingsScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formName, setFormName] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [formAccuracy, setFormAccuracy] = useState('0.9');

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('token');
      const response = await fetch(`${config.BASE_URL}/decks/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLessons(data.filter((d) => d.is_system).sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLessons(); }, []);

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormName(lesson.deck_name);
      setFormOrder(String(lesson.order_index));
      setFormAccuracy(String(lesson.min_accuracy));
    } else {
      setEditingLesson(null);
      setFormName('');
      setFormOrder(String(lessons.length + 1));
      setFormAccuracy('0.9');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName || !formOrder) {
      Alert.alert('Error', 'Nombre y Orden son obligatorios');
      return;
    }
    try {
      const token = await SecureStore.getItemAsync('token');
      const userInfo = await SecureStore.getItemAsync('userInfo');
      const user = JSON.parse(userInfo);
      const userId = user?.user_id || user?.id;
      const body = {
        name: formName,
        user_id: Number(userId),
        is_system: true,
        order_index: parseInt(formOrder),
        min_accuracy: parseFloat(formAccuracy),
      };
      const url = editingLesson
        ? `${config.BASE_URL}/decks/${editingLesson.deck_id}`
        : `${config.BASE_URL}/decks`;
      const method = editingLesson ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setModalVisible(false);
        fetchLessons();
        Alert.alert('Éxito', editingLesson ? 'Lección actualizada' : 'Lección creada');
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'No se pudo guardar la lección');
      }
    } catch {
      Alert.alert('Error', 'Ocurrió un error al conectar con el servidor');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Eliminar Lección', '¿Estás seguro? Se eliminarán todas las flashcards asociadas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const token = await SecureStore.getItemAsync('token');
          const userInfo = await SecureStore.getItemAsync('userInfo');
          const user = JSON.parse(userInfo);
          const userId = user?.user_id || user?.id;
          await fetch(`${config.BASE_URL}/decks?deckId=${id}&userId=${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchLessons();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 h-[60px] bg-surface border-b border-border">
        <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.colors.primary} size={28} />
        </Button>
        <Typography type="h5" weight="bold">Panel de Administración</Typography>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Card className="mb-8">
          <Card.Body className="items-center px-6 py-6">
            <Shield color={theme.colors.primary} size={40} style={{ marginBottom: 10 }} />
            <Typography type="h5" weight="bold" align="center" className="mb-1">Gestión de Lecciones</Typography>
            <Typography type="body-sm" color="muted" align="center" className="leading-5">
              Configura la Ruta de Aprendizaje. El orden determina la secuencia de desbloqueo.
            </Typography>
          </Card.Body>
        </Card>

        {/* Section Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Typography type="h5" weight="bold">Lecciones Actuales</Typography>
          <Button size="sm" onPress={() => openModal()}>
            <Plus color="#fff" size={16} />
            <Button.Label>Nueva</Button.Label>
          </Button>
        </View>

        {loading ? (
          <View className="items-center mt-10">
            <Spinner size="lg" />
          </View>
        ) : (
          lessons.map((item) => (
            <Card key={item.deck_id} className="mb-3">
              <Card.Body className="flex-row items-center px-4 py-3">
                <Button
                  variant="ghost"
                  className="flex-row items-center gap-4 flex-1 justify-start"
                  onPress={() => navigation.navigate('DeckDetails', { deck: item })}
                >
                  <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
                    <Typography type="body" weight="bold" className="text-accent">{item.order_index}</Typography>
                  </View>
                  <View>
                    <Typography type="body" weight="bold">{item.deck_name}</Typography>
                    <Typography type="body-xs" color="muted">
                      Min Accuracy: {(item.min_accuracy * 100).toFixed(0)}%
                    </Typography>
                  </View>
                </Button>
                <View className="flex-row gap-4 ml-2">
                  <Button isIconOnly variant="ghost" onPress={() => openModal(item)}>
                    <Edit3 color={theme.colors.mutedForeground} size={20} />
                  </Button>
                  <Button isIconOnly variant="ghost" onPress={() => handleDelete(item.deck_id)}>
                    <Trash2 color="#dc3545" size={20} />
                  </Button>
                </View>
              </Card.Body>
            </Card>
          ))
        )}

        {lessons.length === 0 && !loading && (
          <Typography type="body-sm" color="muted" align="center" className="mt-10">
            No hay lecciones configuradas.
          </Typography>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-backdrop justify-end">
          <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-10 min-h-[400px]">
            <View className="flex-row justify-between items-center mb-6">
              <Typography type="h4" weight="bold">
                {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
              </Typography>
              <Button isIconOnly variant="ghost" onPress={() => setModalVisible(false)}>
                <X color="#6B7280" size={24} />
              </Button>
            </View>

            <Typography type="body-sm" weight="semibold" className="mb-1">Nombre de la Lección</Typography>
            <Input
              className="w-full mb-4"
              value={formName}
              onChangeText={setFormName}
              placeholder="Ej. Greetings"
            />

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Typography type="body-sm" weight="semibold" className="mb-1">Orden</Typography>
                <Input
                  className="w-full"
                  value={formOrder}
                  onChangeText={setFormOrder}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Typography type="body-sm" weight="semibold" className="mb-1">Precisión Min (0-1)</Typography>
                <Input
                  className="w-full"
                  value={formAccuracy}
                  onChangeText={setFormAccuracy}
                  placeholder="0.9"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button size="lg" className="w-full mt-2" onPress={handleSave}>
              <Save color="#fff" size={20} />
              <Button.Label>Guardar Lección</Button.Label>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
