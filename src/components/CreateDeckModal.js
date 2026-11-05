import React, { useEffect, useState } from 'react';
import { View, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Layers } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useFeedback } from './feedback/FeedbackProvider';
import { createDeck } from '../services/decks.service';
import { getErrorMessage } from '../utils/errors';
import FormField from './ui/FormField';
import { elevation } from '../theme/theme';

/**
 * Modal para crear un mazo. Los errores se muestran dentro del modal y, al
 * terminar, se cierra y avisa con un toast (indicando si quedó guardado offline).
 */
export default function CreateDeck({ visible, onClose, onCreateDeck }) {
  const { user } = useAuth();
  const userId = getUserId(user);
  const { theme } = useAppTheme();
  const { toast } = useFeedback();

  const [deckName, setDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) { setDeckName(''); setError(null); }
  }, [visible]);

  const handleCreate = async () => {
    const name = deckName.trim();
    if (!name) { setError('Escribe un nombre para el mazo.'); return; }
    if (!userId) { setError('No se encontró tu sesión. Inicia sesión nuevamente.'); return; }

    setLoading(true);
    setError(null);
    try {
      const deck = await createDeck(name, userId);
      onClose();
      onCreateDeck?.(deck);
      if (deck.pending) {
        toast.offline('Mazo guardado en el dispositivo', { message: 'Se sincronizará cuando vuelva la conexión.' });
      } else {
        toast.success(`Mazo “${name}” creado`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear el mazo.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { if (!loading) onClose(); };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.colors.backdrop }}
      >
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={handleClose} accessibilityLabel="Cerrar" />
        <Animated.View
          entering={ZoomIn.springify().damping(20).stiffness(260).mass(0.7)}
          className="w-full max-w-[420px] rounded-3xl border border-border bg-overlay px-6 pb-5 pt-7"
          style={elevation(3, theme.mode)}
        >
          <View className="mb-4 h-14 w-14 items-center justify-center self-center rounded-full bg-accent/10">
            <Layers color={theme.colors.primary} size={26} strokeWidth={2.2} />
          </View>
          <Typography type="h5" weight="bold" align="center" className="mb-1.5">Crear nuevo mazo</Typography>
          <Typography type="body-sm" color="muted" align="center" className="mb-6 leading-5">
            Organiza tus tarjetas en un mazo personalizado para repasarlas mejor.
          </Typography>

          <FormField
            label="Nombre del mazo"
            placeholder="Ej: Negocios avanzado"
            value={deckName}
            onChangeText={(text) => { setDeckName(text); if (error) setError(null); }}
            editable={!loading}
            autoCapitalize="sentences"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            error={error}
            maxLength={60}
          />

          <View className="mt-2 gap-2.5">
            <Button size="lg" className="w-full" onPress={handleCreate} isDisabled={loading}>
              {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : <Button.Label>Crear mazo</Button.Label>}
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onPress={handleClose} isDisabled={loading}>
              <Button.Label className="text-muted">Cancelar</Button.Label>
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
