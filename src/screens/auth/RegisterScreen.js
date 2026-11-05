import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, ShieldCheck, Zap, Trophy } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/auth.service';
import { getErrorMessage, getStatus, isNetworkError } from '../../utils/errors';
import AuthScaffold from '../../components/ui/AuthScaffold';
import FormField from '../../components/ui/FormField';
import InlineAlert from '../../components/ui/InlineAlert';
import PressableScale from '../../components/ui/PressableScale';
import { elevation } from '../../theme/theme';

const registerErrorMessage = (error) => {
  if (isNetworkError(error)) return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  const status = getStatus(error);
  if (status === 400) return getErrorMessage(error, 'Datos inválidos. Verifica el correo y que la contraseña tenga al menos 4 caracteres.');
  if (status === 429) return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  return getErrorMessage(error, 'No se pudo completar el registro. Intenta de nuevo.');
};

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const { login } = useAuth();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [mismatch, setMismatch] = useState(false);

  const clearError = () => { setError(null); setMismatch(false); };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setMismatch(true);
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      const { token, user } = await registerUser(name.trim(), email.trim(), password);
      await login(token, user);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] }));
    } catch (err) {
      setError(registerErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold showLogo title="Crear cuenta" subtitle="Tu viaje al inglés empieza aquí.">
      <View className="mb-6 rounded-3xl border border-border bg-surface px-5 py-6" style={elevation(1, theme.mode)}>
        <FormField
          label="Nombre completo"
          icon={User}
          value={name}
          onChangeText={(t) => { setName(t); clearError(); }}
          placeholder="Ingresa tu nombre"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!loading}
        />
        <FormField
          ref={emailRef}
          label="Correo electrónico"
          icon={Mail}
          value={email}
          onChangeText={(t) => { setEmail(t); clearError(); }}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
        <FormField
          ref={passwordRef}
          label="Contraseña"
          icon={Lock}
          value={password}
          onChangeText={(t) => { setPassword(t); clearError(); }}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
        />
        <FormField
          ref={confirmRef}
          label="Confirmar contraseña"
          icon={ShieldCheck}
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); clearError(); }}
          placeholder="••••••••"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleRegister}
          editable={!loading}
          error={mismatch ? ' ' : null}
        />

        <InlineAlert message={error} className="mb-4" />

        <Button onPress={handleRegister} isDisabled={loading} size="lg" className="w-full">
          {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : <Button.Label>Registrarse</Button.Label>}
        </Button>

        <View className="mt-5 flex-row justify-center">
          <Typography type="body-sm" color="muted">¿Ya tienes cuenta? </Typography>
          <PressableScale onPress={() => navigation.navigate('Login')} haptic={null} hitSlop={8}>
            <Typography type="body-sm" weight="bold" className="text-accent">Inicia sesión</Typography>
          </PressableScale>
        </View>
      </View>

      <View className="w-full flex-row gap-3">
        {[
          { icon: Zap, title: 'Adaptivo', text: 'Tarjetas que aprenden a tu ritmo.' },
          { icon: Trophy, title: 'Recompensas', text: 'Gana puntos por cada nivel dominado.' },
        ].map(({ icon: Icon, title, text }) => (
          <View key={title} className="flex-1 items-center rounded-2xl border border-border bg-surface p-4">
            <Icon color={theme.colors.primary} size={20} />
            <Typography type="body-xs" weight="bold" className="mb-1 mt-2 uppercase tracking-wider text-accent">{title}</Typography>
            <Typography type="body-xs" color="muted" align="center">{text}</Typography>
          </View>
        ))}
      </View>
    </AuthScaffold>
  );
}
