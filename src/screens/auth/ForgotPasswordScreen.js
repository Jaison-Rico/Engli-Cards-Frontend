import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Send, RotateCcw } from 'lucide-react-native';
import { Button, Input, Card, Typography } from 'heroui-native';
import { config } from '../../config/api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      alert('Por favor ingresa tu correo');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        navigation.navigate('OtpVerification', { email });
      } else {
        alert(data.message || 'Error al enviar el código');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 28, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nav */}
        <View className="flex-row items-center mb-10">
          <Button isIconOnly variant="ghost" onPress={() => navigation.goBack()}>
            <ArrowLeft color="#0D4A48" size={24} />
          </Button>
          <Typography type="h4" weight="bold" className="ml-4">Engli-Cards</Typography>
        </View>

        {/* Highlight Card */}
        <Card className="w-full mb-8">
          <Card.Body className="items-center py-10">
            <View className="w-20 h-20 rounded-full bg-background items-center justify-center mb-6 shadow-surface">
              <RotateCcw color="#006386" size={32} strokeWidth={2.5} />
            </View>
            <Typography type="h3" weight="bold" className="mb-3">Reset Password</Typography>
            <Typography type="body-sm" color="muted" align="center" className="leading-6">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Card.Body>
        </Card>

        {/* Email Input */}
        <View className="mb-6">
          <Typography type="body-xs" weight="bold" className="uppercase tracking-widest mb-2 text-foreground">
            EMAIL ADDRESS
          </Typography>
          <View className="flex-row items-center bg-background border border-border rounded-full px-4 h-[52px]">
            <Mail color="#527F7C" size={18} style={{ marginRight: 10 }} />
            <Input
              className="flex-1 bg-transparent"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>
        </View>

        {/* Send Button */}
        <Button
          onPress={handleSend}
          isDisabled={loading}
          size="lg"
          className="w-full rounded-full h-[52px] mb-10"
        >
          <View className="flex-row items-center gap-2">
            <Button.Label>Send</Button.Label>
            <Send color="#ffffff" size={18} />
          </View>
        </Button>

        {/* Footer */}
        <View className="flex-row items-center justify-center">
          <Typography type="body-sm" color="muted">Remember your password? </Typography>
          <Button variant="ghost" size="sm" onPress={() => navigation.navigate('Login')} className="p-0 h-auto">
            <Typography type="body-sm" weight="bold" className="text-foreground">Log In</Typography>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
