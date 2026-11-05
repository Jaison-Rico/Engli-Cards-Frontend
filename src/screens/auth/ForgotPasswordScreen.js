import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Send, KeyRound } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { requestPasswordReset } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/errors';
import AuthScaffold from '../../components/ui/AuthScaffold';
import FormField from '../../components/ui/FormField';
import InlineAlert from '../../components/ui/InlineAlert';
import PressableScale from '../../components/ui/PressableScale';

export default function ForgotPasswordScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      navigation.navigate('OtpVerification', { email: email.trim() });
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo enviar el código.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      onBack={() => navigation.goBack()}
      icon={KeyRound}
      title="Recuperar contraseña"
      subtitle="Escribe el correo de tu cuenta y te enviaremos un código para restablecerla."
    >
      <FormField
        label="Correo electrónico"
        icon={Mail}
        placeholder="nombre@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); }}
        editable={!loading}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />

      <InlineAlert message={error} className="mb-4" />

      <Button onPress={handleSend} isDisabled={loading} size="lg" className="mb-8 w-full">
        {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : (
          <>
            <Button.Label>Enviar código</Button.Label>
            <Send color={theme.colors.onPrimary} size={18} />
          </>
        )}
      </Button>

      <View className="flex-row items-center justify-center">
        <Typography type="body-sm" color="muted">¿Recordaste tu contraseña? </Typography>
        <PressableScale onPress={() => navigation.navigate('Login')} haptic={null} hitSlop={8}>
          <Typography type="body-sm" weight="bold" className="text-accent">Inicia sesión</Typography>
        </PressableScale>
      </View>
    </AuthScaffold>
  );
}
