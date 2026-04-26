import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Settings, BookOpen, Trash2, Edit3, Shield, X, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/api';
import theme from '../styles/theme';

export default function AdminSettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
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
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLessons(data.filter(d => d.is_system).sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

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
        min_accuracy: parseFloat(formAccuracy)
      };

      let url = `${config.BASE_URL}/decks`;
      let method = 'POST';

      if (editingLesson) {
        url = `${config.BASE_URL}/decks/${editingLesson.deck_id}`;
        method = 'PATCH'; // Asumiendo que el backend soporta PATCH para estos campos
        // Nota: Actualmente updateDeckName solo toma name y userId. 
        // Deberíamos actualizar el backend para soportar los nuevos campos en PATCH.
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setModalVisible(false);
        fetchLessons();
        Alert.alert('Éxito', editingLesson ? 'Lección actualizada' : 'Lección creada');
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'No se pudo guardar la lección');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al conectar con el servidor');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Eliminar Lección', '¿Estás seguro? Se eliminarán todas las flashcards asociadas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          const token = await SecureStore.getItemAsync('token');
          const userInfo = await SecureStore.getItemAsync('userInfo');
          const user = JSON.parse(userInfo);
          const userId = user?.user_id || user?.id;
          
          await fetch(`${config.BASE_URL}/decks?deckId=${id}&userId=${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchLessons();
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Shield color={theme.colors.primary} size={40} style={{ marginBottom: 10 }} />
          <Text style={styles.infoTitle}>Gestión de Lecciones</Text>
          <Text style={styles.infoDesc}>Configura la Ruta de Aprendizaje. El orden determina la secuencia de desbloqueo.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lecciones Actuales</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal()}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          lessons.map((item) => (
            <View key={item.deck_id} style={styles.lessonItem}>
              <TouchableOpacity 
                style={styles.lessonInfo}
                onPress={() => navigation.navigate('DeckDetails', { deck: item })}
              >
                <Text style={styles.lessonOrder}>{item.order_index}</Text>
                <View>
                  <Text style={styles.lessonName}>{item.deck_name}</Text>
                  <Text style={styles.lessonMeta}>Min Accuracy: {(item.min_accuracy * 100).toFixed(0)}%</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)}>
                   <Edit3 color={theme.colors.mutedForeground} size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.deck_id)}>
                   <Trash2 color="#dc3545" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        {lessons.length === 0 && !loading && (
          <Text style={styles.emptyText}>No hay lecciones configuradas.</Text>
        )}
      </ScrollView>

      {/* Modal para Crear/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Nombre de la Lección</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Ej. Greetings"
              />

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Orden</Text>
                  <TextInput
                    style={styles.input}
                    value={formOrder}
                    onChangeText={setFormOrder}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Precisión Min (0-1)</Text>
                  <TextInput
                    style={styles.input}
                    value={formAccuracy}
                    onChangeText={setFormAccuracy}
                    placeholder="0.9"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save color="#fff" size={20} />
                <Text style={styles.saveButtonText}>Guardar Lección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: 20 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  infoDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12B5B0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  lessonOrder: {
    fontSize: 18,
    fontWeight: '900',
    color: '#12B5B0',
    backgroundColor: '#E8F5F0',
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
  },
  lessonName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  lessonMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 15 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12B5B0',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
