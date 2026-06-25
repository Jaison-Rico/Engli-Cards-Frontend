import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle2, Timer } from 'lucide-react-native';
import { Button, Typography } from 'heroui-native';
import { config } from '../../config/api';
import { useAppTheme } from '../../context/ThemeContext';

export default function OtpScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { email } = route.params || { email: 'usuario@ejemplo.com' };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1].focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleValidate = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      alert('Por favor ingresa el código completo');
      return;
    }
    try {
      const response = await fetch(`${config.BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });
      const data = await response.json();
      if (response.ok) {
        navigation.navigate('NewPassword', { resetToken: data.resetToken });
      } else {
        alert(data.message || 'Error al validar el código');
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
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 28, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center w-full mb-5">
          <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
            <ArrowLeft color="#0D4A48" size={24} />
          </Button>
          <Typography type="h4" weight="bold" className="ml-4 flex-1">Verificación</Typography>
          <CheckCircle2 color="#0D4A48" size={24} />
        </View>

        {/* Icon */}
        <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mt-4 mb-8 shadow-surface">
          <View className="bg-accent p-4 rounded-3xl">
            <Mail color="#ffffff" size={32} />
          </View>
        </View>

        <Typography type="h2" weight="bold" align="center" className="mb-2">Verificación de Código</Typography>
        <Typography type="body" color="muted" align="center" className="mb-10 leading-6">
          Ingresa el código que te llegó al correo
        </Typography>

        {/* OTP Inputs */}
        <View className="flex-row justify-center mb-12 gap-2">
          {otp.map((digit, index) => (
            <View
              key={index}
              className={`w-11 h-11 rounded-full border items-center justify-center ${digit ? 'bg-surface shadow-surface border-transparent' : 'border-border bg-surface'}`}
            >
              <TextInput
                ref={(el) => (inputs.current[index] = el)}
                style={{ fontSize: 20, fontWeight: '700', color: theme.colors.foreground, textAlign: 'center' }}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                textAlign="center"
              />
            </View>
          ))}
        </View>

        {/* Validate Button */}
        <Button
          onPress={handleValidate}
          size="lg"
          className="w-full rounded-full h-[52px] mb-10"
        >
          <Button.Label>Validar</Button.Label>
        </Button>

        {/* Resend */}
        <View className="flex-row items-center mb-6">
          <Typography type="body-sm" color="muted">¿No recibiste el código? </Typography>
          <Button variant="ghost" size="sm" isDisabled={timer > 0} className="p-0 h-auto">
            <Typography type="body-sm" weight="bold" className={timer > 0 ? 'text-border' : 'text-foreground'}>
              Reenviar código
            </Typography>
          </Button>
        </View>

        {/* Timer */}
        <View className="flex-row items-center bg-default px-5 py-3 rounded-full gap-2">
          <Timer color="#0D4A48" size={16} />
          <Typography type="body-sm" weight="bold" className="text-accent uppercase tracking-wider">
            EXPIRA EN {formatTime(timer)}
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
