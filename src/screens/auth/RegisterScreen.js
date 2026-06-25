import { View, KeyboardAvoidingView, Platform, ScrollView, Image, StatusBar } from 'react-native';
import { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Lock, ShieldCheck, Zap, Trophy } from 'lucide-react-native';
import { Button, Input, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/auth.service';

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!name || !email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await registerUser(name, email, password);
      await login(token, user);
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
      );
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 400) alert(msg || 'Datos inválidos. Verifica que el correo sea válido y la contraseña tenga al menos 4 caracteres.');
      else if (status === 429) alert('Demasiados intentos. Espera un momento y vuelve a intentarlo.');
      else if (!error.response) alert('No se pudo conectar con el servidor. Verifica tu conexión.');
      else alert(msg || 'No se pudo completar el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const iconRow = (IconComp, value, setter, placeholder, props = {}) => (
    <View className="flex-row items-center bg-background border border-border rounded-md px-4 h-[52px] mb-4">
      <IconComp color={theme.colors.mutedForeground} size={18} style={{ marginRight: 10 }} />
      <Input
        className="flex-1 bg-transparent"
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        {...props}
      />
    </View>
  );

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
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20, paddingHorizontal: 28, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mt-10 mb-6">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4 shadow-surface">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>
          <Typography type="h2" weight="bold">Engli-Cards</Typography>
          <Typography type="body-sm" color="muted">Tu viaje al inglés empieza aquí</Typography>
        </View>

        {/* Form Card */}
        <View className="w-full bg-surface rounded-3xl p-6 shadow-surface mb-6">
          <Typography type="h3" weight="bold" className="mb-1">Crear cuenta</Typography>
          <Typography type="body-sm" color="muted" className="mb-6">Empieza tu rutina de aprendizaje diario.</Typography>

          <Typography type="body-sm" className="mb-2 text-foreground">Nombre completo</Typography>
          {iconRow(User, name, setName, 'Ingresa tu nombre', { autoCapitalize: 'words' })}

          <Typography type="body-sm" className="mb-2 text-foreground">Correo electrónico</Typography>
          {iconRow(Mail, email, setEmail, 'ejemplo@correo.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}

          <Typography type="body-sm" className="mb-2 text-foreground">Contraseña</Typography>
          {iconRow(Lock, password, setPassword, '••••••••', { secureTextEntry: true })}

          <Typography type="body-sm" className="mb-2 text-foreground">Confirmar contraseña</Typography>
          {iconRow(ShieldCheck, confirmPassword, setConfirmPassword, '••••••••', { secureTextEntry: true })}

          <Button
            onPress={handleRegister}
            isDisabled={loading}
            size="lg"
            className="w-full rounded-md h-[52px] mt-2"
          >
            {loading
              ? <Spinner color="white" size="sm" />
              : <Button.Label>Registrarse</Button.Label>
            }
          </Button>

          <View className="flex-row justify-center mt-5">
            <Typography type="body-sm" color="muted">¿Ya tienes cuenta? </Typography>
            <Button variant="ghost" size="sm" onPress={() => navigation.navigate('Login')} className="p-0 h-auto">
              <Typography type="body-sm" weight="bold" className="text-accent">Inicia sesión</Typography>
            </Button>
          </View>
        </View>

        {/* Info Blocks */}
        <View className="flex-row w-full mb-8 gap-3">
          <View className="flex-1 bg-default rounded-md p-4 items-center">
            <Zap color={theme.colors.primary} size={20} />
            <Typography type="body-sm" weight="bold" className="text-accent uppercase tracking-wider mt-2 mb-1">ADAPTIVO</Typography>
            <Typography type="body-xs" color="muted" align="center">Tarjetas que aprenden a tu ritmo.</Typography>
          </View>
          <View className="flex-1 bg-default rounded-md p-4 items-center">
            <Trophy color={theme.colors.primary} size={20} />
            <Typography type="body-sm" weight="bold" className="text-accent uppercase tracking-wider mt-2 mb-1">RECOMPENSAS</Typography>
            <Typography type="body-xs" color="muted" align="center">Gana puntos por cada nivel dominado.</Typography>
          </View>
        </View>

        {/* Bottom Links */}
        <View className="flex-row justify-center mb-10 gap-8">
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Typography type="body-xs" color="muted">Privacidad</Typography>
          </Button>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Typography type="body-xs" color="muted">Términos de uso</Typography>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
