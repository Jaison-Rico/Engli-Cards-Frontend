import React, { useEffect, useState } from 'react';
import { View, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Button, Spinner, Typography } from 'heroui-native';
import { Pencil } from 'lucide-react-native';
import FormField from '../ui/FormField';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../utils/errors';
import { elevation } from '../../theme/theme';

/**
 * Modal con un campo de texto (renombrar, editar un valor…).
 * `onSubmit(value)` puede ser async; si lanza un error se muestra en línea.
 */
export default function TextPromptModal({
  visible,
  title,
  label,
  placeholder,
  initialValue = '',
  confirmText = 'Guardar',
  icon: Icon = Pencil,
  validate = (value) => (value.trim() ? null : 'Este campo no puede estar vacío.'),
  onSubmit,
  onClose,
}) {
  const { theme } = useAppTheme();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) { setValue(initialValue); setError(null); }
  }, [visible, initialValue]);

  const handleSubmit = async () => {
    const validationError = validate(value);
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    try {
      await onSubmit(value.trim());
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron guardar los cambios.'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { if (!saving) onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.colors.backdrop }}
      >
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={handleClose} accessibilityLabel="Cerrar" />
        <Animated.View
          entering={ZoomIn.springify().damping(38).stiffness(360)}
          className="w-full max-w-[420px] rounded-[28px] border border-border bg-overlay px-6 pb-6 pt-8"
          style={elevation(3, theme.mode)}
        >
          <View className="mb-4 h-14 w-14 items-center justify-center self-center rounded-full bg-accent/10">
            <Icon color={theme.colors.primary} size={24} strokeWidth={2.2} />
          </View>
          <Typography type="h5" weight="bold" align="center" className="mb-5">{title}</Typography>
          <FormField
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={(text) => { setValue(text); if (error) setError(null); }}
            editable={!saving}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={error}
            maxLength={60}
          />
          <View className="mt-2 gap-2.5">
            <Button size="lg" className="w-full" onPress={handleSubmit} isDisabled={saving}>
              {saving ? <Spinner color={theme.colors.onPrimary} size="sm" /> : <Button.Label>{confirmText}</Button.Label>}
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onPress={handleClose} isDisabled={saving}>
              <Button.Label className="text-muted">Cancelar</Button.Label>
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
