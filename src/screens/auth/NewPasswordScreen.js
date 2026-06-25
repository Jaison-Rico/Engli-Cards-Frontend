import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, RotateCcw } from 'lucide-react-native';
import { Button, Input, Typography } from 'heroui-native';
import { config } from '../../config/api';
import { useAppTheme } from '../../context/ThemeContext';

export default function NewPasswordScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { resetToken } = route.params || { resetToken: '' };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checkStrength = () => {
    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = checkStrength();

  const handleReset = async () => {
    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await fetch(`${config.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('¡Contraseña actualizada con éxito!');
        navigation.navigate('Login');
      } else {
        alert(data.message || 'Error al restablecer la contraseña');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-secondary"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 28, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Nav */}
        <View className="flex-row items-center mb-8">
          <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
            <ArrowLeft color="#0D4A48" size={24} />
          </Button>
          <Typography type="h4" weight="bold" className="ml-4">Reset Password</Typography>
        </View>

        {/* Icon */}
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-6 shadow-surface self-center">
          <RotateCcw color="#00BFA5" size={32} />
        </View>

        <Typography type="h2" weight="bold" align="center" className="mt-6 mb-2">Nueva Contraseña</Typography>
        <Typography type="body-sm" color="muted" align="center" className="mb-8 leading-6">
          Escribe tu nueva contraseña para acceder a tu cuenta.
        </Typography>

        {/* Password Input */}
        <View className="mb-6">
          <Typography type="body-xs" weight="bold" className="uppercase tracking-widest mb-2 text-foreground">
            Escriba contraseña
          </Typography>
          <View className="flex-row items-center bg-surface border border-border rounded-full px-4 h-[52px]">
            <Lock color="#527F7C" size={18} style={{ marginRight: 10 }} />
            <Input
              className="flex-1 bg-transparent"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Button isIconOnly variant="ghost" size="sm" onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#527F7C" size={20} /> : <Eye color="#527F7C" size={20} />}
            </Button>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Typography type="body-xs" weight="bold" className="uppercase tracking-widest mb-2 text-foreground">
            Confirmar contraseña
          </Typography>
          <View className="flex-row items-center bg-surface border border-border rounded-full px-4 h-[52px]">
            <ShieldCheck color="#527F7C" size={18} style={{ marginRight: 10 }} />
            <Input
              className="flex-1 bg-transparent"
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Button isIconOnly variant="ghost" size="sm" onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff color="#527F7C" size={20} /> : <Eye color="#527F7C" size={20} />}
            </Button>
          </View>
        </View>

        {/* Strength Bars */}
        <View className="flex-row justify-between mb-2 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${strength >= i ? 'bg-accent' : 'bg-border'}`}
            />
          ))}
        </View>
        <Typography type="body-xs" color="muted" align="center" className="mb-8">
          Usa al menos 8 caracteres con letras y números.
        </Typography>

        {/* Submit */}
        <Button onPress={handleReset} size="lg" className="w-full rounded-full h-[52px] mb-10">
          <Button.Label>Cambiar</Button.Label>
        </Button>

        <Button variant="ghost" className="self-center">
          <Typography type="body-sm" weight="bold" className="text-foreground">
            ¿Necesitas ayuda con tu cuenta?
          </Typography>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
