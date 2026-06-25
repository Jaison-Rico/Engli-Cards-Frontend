import { View, KeyboardAvoidingView, Platform, ScrollView, Image, StatusBar } from 'react-native';
import { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { Button, Input, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/auth.service';

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor ingresa correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      await login(token, user);
      const destination = user.onboarding_completed ? 'BottomTabs' : 'Onboarding';
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: destination }] })
      );
    } catch (error) {
      if (!error.response) {
        alert('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
        return;
      }
      const status = error.response?.status;
      const msg = error.response?.data?.message || '';
      if (status === 400) alert(msg || 'Solicitud inválida. Revisa los campos.');
      else if (status === 401) alert(msg || 'Credenciales incorrectas.');
      else if (status === 404) alert(msg || 'Usuario no encontrado.');
      else if (status >= 500) alert('Error del servidor. Intenta más tarde.');
      else alert(msg || `Error ${status}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20, paddingHorizontal: 28, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4 shadow-surface">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>
          <Typography type="h1" weight="bold" className="tracking-tight mb-1">Engli-Cards</Typography>
          <Typography type="body-sm" color="muted">Eleva tu inglés con cada tarjeta.</Typography>
        </View>

        {/* Form Card */}
        <View className="w-full bg-surface rounded-3xl px-6 py-7 shadow-surface mb-7">
          <Typography type="h3" weight="bold" className="mb-6">Bienvenido de nuevo</Typography>

          {/* Email */}
          <View className="mb-5">
            <Typography type="body-sm" weight="bold" className="uppercase tracking-widest mb-2 text-foreground">
              Correo electrónico
            </Typography>
            <View className="flex-row items-center bg-background rounded-full border border-border px-4 h-[52px]">
              <Mail color={theme.colors.mutedForeground} size={18} style={{ marginRight: 10 }} />
              <Input
                className="flex-1 bg-transparent"
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Typography type="body-sm" weight="bold" className="uppercase tracking-widest text-foreground">
                Contraseña
              </Typography>
              <Button variant="ghost" size="sm" onPress={() => navigation.navigate('ResetPassword')} className="p-0 h-auto">
                <Typography type="body-sm" className="text-accent">¿Olvidaste tu contraseña?</Typography>
              </Button>
            </View>
            <View className="flex-row items-center bg-background rounded-full border border-border px-4 h-[52px]">
              <Lock color={theme.colors.mutedForeground} size={18} style={{ marginRight: 10 }} />
              <Input
                className="flex-1 bg-transparent"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <Button isIconOnly variant="ghost" size="sm" onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff color={theme.colors.mutedForeground} size={18} />
                  : <Eye color={theme.colors.mutedForeground} size={18} />
                }
              </Button>
            </View>
          </View>

          {/* Login Button */}
          <Button
            onPress={handleLogin}
            isDisabled={loading}
            size="lg"
            className="w-full rounded-full h-[52px]"
          >
            {loading
              ? <Spinner color="white" size="sm" />
              : (
                <View className="flex-row items-center gap-2">
                  <Button.Label>Iniciar Sesión</Button.Label>
                  <LogIn color="#fff" size={18} />
                </View>
              )
            }
          </Button>
        </View>

        {/* Footer */}
        <View className="flex-row items-center">
          <Typography type="body-sm" color="muted">¿No tienes cuenta? </Typography>
          <Button variant="ghost" size="sm" onPress={() => navigation.navigate('Register')} className="p-0 h-auto">
            <Typography type="body-sm" weight="bold" className="text-accent">Crear cuenta</Typography>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
