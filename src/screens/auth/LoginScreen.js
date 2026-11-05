import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/auth.service';
import { getErrorMessage, getStatus, isNetworkError } from '../../utils/errors';
import AuthScaffold from '../../components/ui/AuthScaffold';
import FormField from '../../components/ui/FormField';
import InlineAlert from '../../components/ui/InlineAlert';
import IconButton from '../../components/ui/IconButton';
import PressableScale from '../../components/ui/PressableScale';
import { elevation } from '../../theme/theme';

const loginErrorMessage = (error) => {
  if (isNetworkError(error)) return 'No se pudo conectar con el servidor. Revisa tu conexión a Internet.';
  const status = getStatus(error);
  if (status === 401) return getErrorMessage(error, 'Correo o contraseña incorrectos.');
  if (status === 404) return getErrorMessage(error, 'No existe una cuenta con ese correo.');
  if (status === 429) return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  if (status >= 500) return 'Error del servidor. Intenta más tarde.';
  return getErrorMessage(error, 'No se pudo iniciar sesión.');
};

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const { login } = useAuth();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginUser(email.trim(), password);
      await login(token, user);
      const destination = user.onboarding_completed ? 'BottomTabs' : 'Onboarding';
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: destination }] }));
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold showLogo title="Engli-Cards" subtitle="Eleva tu inglés con cada tarjeta.">
      <View className="mb-6 rounded-3xl border border-border bg-surface px-5 py-6" style={elevation(1, theme.mode)}>
        <Typography type="h5" weight="bold" className="mb-5">Bienvenido de nuevo</Typography>

        <FormField
          label="Correo electrónico"
          icon={Mail}
          value={email}
          onChangeText={(text) => { setEmail(text); setError(null); }}
          placeholder="nombre@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />

        <FormField
          ref={passwordRef}
          label="Contraseña"
          icon={Lock}
          value={password}
          onChangeText={(text) => { setPassword(text); setError(null); }}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          editable={!loading}
          className="mb-2"
          trailing={(
            <IconButton
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onPress={() => setShowPassword(!showPassword)}
              className="-mr-3 h-10 w-10"
            >
              {showPassword ? <EyeOff color={theme.colors.muted} size={18} /> : <Eye color={theme.colors.muted} size={18} />}
            </IconButton>
          )}
        />

        <PressableScale
          onPress={() => navigation.navigate('ResetPassword')}
          haptic={null}
          hitSlop={8}
          className="mb-5 self-end py-1"
        >
          <Typography type="body-sm" weight="semibold" className="text-accent">¿Olvidaste tu contraseña?</Typography>
        </PressableScale>

        <InlineAlert message={error} className="mb-4" />

        <Button onPress={handleLogin} isDisabled={loading} size="lg" className="w-full">
          {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : (
            <>
              <Button.Label>Iniciar sesión</Button.Label>
              <LogIn color={theme.colors.onPrimary} size={18} />
            </>
          )}
        </Button>
      </View>

      <View className="flex-row items-center justify-center">
        <Typography type="body-sm" color="muted">¿No tienes cuenta? </Typography>
        <PressableScale onPress={() => navigation.navigate('Register')} haptic={null} hitSlop={8}>
          <Typography type="body-sm" weight="bold" className="text-accent">Crear cuenta</Typography>
        </PressableScale>
      </View>
    </AuthScaffold>
  );
}
