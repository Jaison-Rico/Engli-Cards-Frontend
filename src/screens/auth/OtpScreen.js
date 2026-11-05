import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MailCheck, Timer } from 'lucide-react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../components/feedback/FeedbackProvider';
import { verifyResetCode, requestPasswordReset } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/errors';
import AuthScaffold from '../../components/ui/AuthScaffold';
import InlineAlert from '../../components/ui/InlineAlert';
import PressableScale from '../../components/ui/PressableScale';

const CODE_LENGTH = 6;
const EXPIRATION_SECONDS = 300;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function OtpScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { toast } = useFeedback();
  const { email } = route.params || { email: '' };

  const [otp, setOtp] = useState(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(EXPIRATION_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const digits = value.replace(/\D/g, '');
    setError(null);
    // Pegar el código completo de una vez.
    if (digits.length > 1) {
      const next = digits.slice(0, CODE_LENGTH).split('');
      setOtp([...next, ...Array(CODE_LENGTH - next.length).fill('')]);
      inputs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = digits;
    setOtp(next);
    if (digits && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleValidate = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < CODE_LENGTH) { setError('Ingresa el código completo de 6 dígitos.'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await verifyResetCode(email, fullOtp);
      navigation.navigate('NewPassword', { resetToken: data.resetToken });
    } catch (err) {
      setError(getErrorMessage(err, 'El código no es válido.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestPasswordReset(email);
      setTimer(EXPIRATION_SECONDS);
      setOtp(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
      toast.success('Código reenviado', { message: `Revisa ${email}.` });
    } catch (err) {
      toast.error('No se pudo reenviar el código', { message: getErrorMessage(err) });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScaffold
      onBack={() => navigation.goBack()}
      icon={MailCheck}
      title="Verifica tu correo"
      subtitle={email ? `Ingresa el código de 6 dígitos que enviamos a ${email}.` : 'Ingresa el código que te llegó al correo.'}
    >
      <View className="mb-6 flex-row justify-center gap-2">
        {otp.map((digit, index) => {
          const focused = focusedIndex === index;
          return (
            <View
              key={index}
              className="h-14 w-12 items-center justify-center rounded-2xl bg-field"
              style={{
                borderWidth: focused ? 1.5 : 1,
                borderColor: error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border,
              }}
            >
              <TextInput
                ref={(el) => { inputs.current[index] = el; }}
                style={{ fontSize: 22, fontWeight: '700', color: theme.colors.foreground, textAlign: 'center', width: '100%', paddingVertical: 0 }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete={index === 0 ? 'sms-otp' : 'off'}
                maxLength={index === 0 ? CODE_LENGTH : 1}
                value={digit}
                onFocus={() => setFocusedIndex(index)}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                accessibilityLabel={`Dígito ${index + 1}`}
                autoFocus={index === 0}
              />
            </View>
          );
        })}
      </View>

      <InlineAlert message={error} className="mb-4" />

      <Button onPress={handleValidate} isDisabled={loading} size="lg" className="mb-8 w-full">
        {loading ? <Spinner color={theme.colors.onPrimary} size="sm" /> : <Button.Label>Validar código</Button.Label>}
      </Button>

      <View className="items-center gap-4">
        <View className="flex-row items-center gap-2 rounded-full bg-default px-4 py-2">
          <Timer color={theme.colors.muted} size={15} />
          <Typography type="body-sm" weight="semibold" color="muted">
            {timer > 0 ? `El código expira en ${formatTime(timer)}` : 'El código expiró'}
          </Typography>
        </View>
        <View className="flex-row items-center">
          <Typography type="body-sm" color="muted">¿No recibiste el código? </Typography>
          <PressableScale onPress={handleResend} disabled={timer > 240 || resending} haptic={null} hitSlop={8}>
            <Typography type="body-sm" weight="bold" className={timer > 240 || resending ? 'text-muted' : 'text-accent'}>
              {resending ? 'Enviando…' : 'Reenviar'}
            </Typography>
          </PressableScale>
        </View>
      </View>
    </AuthScaffold>
  );
}
