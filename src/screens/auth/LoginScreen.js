import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { get_loginStyles } from '../../styles/auth.styles';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/auth.service';

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const styles = get_loginStyles(theme);
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
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs' }] })
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTitle}>Engli-Cards</Text>
          <Text style={styles.appSubtitle}>Eleva tu inglés con cada tarjeta.</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputContainer}>
              <Mail color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@ejemplo.com"
                placeholderTextColor={theme.colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Lock color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.mutedForeground}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff color={theme.colors.mutedForeground} size={18} />
                ) : (
                  <Eye color={theme.colors.mutedForeground} size={18} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                <LogIn color="#fff" size={18} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
