import React, { useState, useEffect } from 'react';
import { View, Modal, Animated, Platform } from 'react-native';
import { CheckCircle, AlertCircle, Layers } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuth, getUserId } from '../context/AuthContext';
import { createDeck } from '../services/decks.service';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';

export default function CreateDeck({ visible, onClose, onCreateDeck }) {
  const { user } = useAuth();
  const userId = getUserId(user);

  const [deckName, setDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [toastAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (toast.visible) {
      Animated.sequence([
        Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.delay(2500),
        Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast({ visible: false, message: '', type: '' }));
    }
  }, [toast.visible]);

  const showToast = (message, type) => setToast({ visible: true, message, type });

  const handleCreate = async () => {
    if (!deckName.trim()) {
      showToast('Por favor ingresa un nombre para el mazo', 'error');
      return;
    }
    if (!userId) {
      showToast('No se encontró el ID de usuario', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await createDeck(deckName.trim(), userId);
      showToast(`¡Mazo "${deckName}" creado exitosamente!`, 'success');
      setTimeout(() => {
        if (onCreateDeck) onCreateDeck(response);
        setDeckName('');
        onClose();
      }, 1500);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Error al crear el mazo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setDeckName(''); onClose(); };

  const OverlayComponent = Platform.OS === 'web' ? View : BlurView;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <OverlayComponent intensity={20} tint="dark" className="flex-1 items-center justify-center px-6">

        <Card className="w-full">
          <Card.Body className="items-center px-6 py-8">
            {/* Icon */}
            <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center mb-4">
              <Layers color="#084E4D" size={28} strokeWidth={2.5} />
            </View>

            <Typography type="h4" weight="bold" align="center" className="mb-2">Crear Nuevo Mazo</Typography>
            <Typography type="body-sm" color="muted" align="center" className="mb-6 leading-5">
              Organiza tus tarjetas de aprendizaje en un mazo personalizado para mejorar tu retención.
            </Typography>

            <Typography type="body-sm" weight="semibold" className="self-start mb-2">Nombre del Mazo</Typography>
            <Input
              className="w-full mb-5"
              placeholder="Ej: Negocios Avanzado"
              value={deckName}
              onChangeText={setDeckName}
              editable={!loading}
              autoCapitalize="sentences"
            />

            <Button
              size="lg"
              className="w-full mb-3"
              onPress={handleCreate}
              isDisabled={loading}
            >
              {loading
                ? <Spinner color="white" size="sm" />
                : <Button.Label>Crear Mazo</Button.Label>
              }
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onPress={handleClose}
              isDisabled={loading}
            >
              <Button.Label>Cancelar</Button.Label>
            </Button>
          </Card.Body>
        </Card>

        {/* Toast */}
        {toast.visible && (
          <Animated.View
            className="absolute top-0 self-center rounded-2xl px-4 py-3 flex-row items-center gap-3"
            style={{
              backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
              transform: [
                { translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 50] }) },
                { scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
              opacity: toastAnim,
            }}
          >
            {toast.type === 'success'
              ? <CheckCircle size={22} color="white" />
              : <AlertCircle size={22} color="white" />
            }
            <Typography type="body-sm" weight="semibold" className="text-white">{toast.message}</Typography>
          </Animated.View>
        )}
      </OverlayComponent>
    </Modal>
  );
}
