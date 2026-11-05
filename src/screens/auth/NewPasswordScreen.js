import React, { useState } from 'react';
import { View } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Lock, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import { resetPassword } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/errors';
import AuthScaffold from '../../components/ui/AuthScaffold';
import FormField from '../../components/ui/FormField';
import InlineAlert from '../../components/ui/InlineAlert';
import IconButton from '../../components/ui/IconButton';

const STRENGTH_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];

const getStrength = (password) => {
  let strength = 0;
  if (password.length > 5) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  return strength;
};

export default function NewPasswordScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { toast } = useFeedback();
  const { resetToken } = route.params || { resetToken: '' };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const strength = getStrength(password);

  const handleReset = async () => {
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetToken, password);
      toast.success('¡Contraseña actualizada!', { message: 'Ya puedes iniciar sesión con tu nueva contraseña.' });
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo restablecer la contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  const toggle = (visible, setVisible, label) => (
    <IconButton accessibilityLabel={visible ? `Ocultar ${label}` : `Mostrar ${label}`} onPress={() => setVisible(!visible)} className="-mr-3 h-10 w-10">
      {visible ? <EyeOff color={theme.colors.muted} size={18} /> : <Eye color={theme.colors.muted} size={18} />}
    </IconButton>
  );

  return (
    <AuthScaffold
      onBack={() => navigation.goBack()}
      icon={KeyRound}
      title="Nueva contraseña"
      subtitle="Escribe tu nueva contraseña para acceder a tu cuenta."
    >
      <FormField
        label="Nueva contraseña"
        icon={Lock}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        autoComplete="new-password"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        editable={!loading}
        trailing={toggle(showPassword, setShowPassword, 'contraseña')}
      />
      <FormField
        label="Confirmar contraseña"
        icon={ShieldCheck}
        placeholder="••••••••"
        secureTextEntry={!showConfirm}
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
        editable={!loading}
        returnKeyType="go"
        onSubmitEditing={handleReset}
        trailing={toggle(showConfirm, setShowConfirm, 'confirmación')}
      />

      <View className="mb-1.5 flex-row gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className={`h-1.5 flex-1 rounded-full ${strength >= i ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </View>
      <Typography type="body-xs" color="muted" className="mb-6">
        {password ? `${STRENGTH_LABELS[strength]} · ` : ''}Usa al menos 8 caracteres con mayúsculas y números.
      </Typography>

      <InlineAlert message={error} className="mb-4" />

      <Button onPress={handleReset} isDisabled={loading} size="lg" className="w-full">
        {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : <Button.Label>Cambiar contraseña</Button.Label>}
      </Button>
    </AuthScaffold>
  );
}
