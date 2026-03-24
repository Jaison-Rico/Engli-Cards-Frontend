import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StatusBar, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { config } from '../config/api';
import { ArrowLeft, Mail, CheckCircle2, Timer } from "lucide-react-native";
import { loginStyles as styles } from "../styles/loginStyles";

export default function OtpScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { email } = route.params || { email: "usuario@ejemplo.com" };

    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(300); // 5 minutes
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

        if (value && index < 3) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleValidate = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length < 4) {
            alert("Por favor ingresa el código completo");
            return;
        }

        try {
            // Reemplazar con URL real o variable de entorno
            const response = await fetch(`${config.BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: fullOtp })
            });

            const data = await response.json();

            if (response.ok) {
                navigation.navigate("NewPassword", { resetToken: data.resetToken });
            } else {
                alert(data.message || "Error al validar el código");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: '#E8F5F0' }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5F0" />
            <ScrollView 
                contentContainerStyle={[
                    styles.otpMainContainer,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={[styles.resetNavRow, { marginBottom: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft color="#0D4A48" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.resetNavTitle}>Verificación</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <CheckCircle2 color="#0D4A48" size={24} />
                    </View>
                </View>

                {/* Illustration/Icon */}
                <View style={styles.otpIconContainer}>
                    <View style={{ backgroundColor: '#12B5B0', padding: 15, borderRadius: 30 }}>
                        <Mail color="#ffffff" size={32} />
                    </View>
                </View>

                {/* Text Content */}
                <Text style={styles.otpTitle}>Verificación de Código</Text>
                <Text style={styles.otpSubtitle}>
                    Ingresa el código que te llegó al correo
                </Text>

                {/* OTP Input Row */}
                <View style={styles.otpInputRow}>
                    {otp.map((digit, index) => (
                        <View key={index} style={[styles.otpCircle, digit ? styles.otpCircleFilled : null]}>
                            <TextInput
                                ref={(el) => (inputs.current[index] = el)}
                                style={styles.otpText}
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
                <TouchableOpacity
                    onPress={handleValidate}
                    style={styles.loginButton}
                    activeOpacity={0.85}
                >
                    <View style={styles.loginButtonContent}>
                        <Text style={styles.loginButtonText}>Validar</Text>
                        <ArrowLeft color="#ffffff" size={18} style={{ marginLeft: 8, transform: [{ rotate: '180deg' }] }} />
                    </View>
                </TouchableOpacity>

                {/* Resend Logic */}
                <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#527F7C', fontSize: 14 }}>¿No recibiste el código? </Text>
                    <TouchableOpacity disabled={timer > 0}>
                        <Text style={{ color: timer > 0 ? '#CBEBE8' : '#0D4A48', fontWeight: '700', fontSize: 14 }}>
                            Reenviar código
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expiration Timer */}
                <View style={styles.timerCapsule}>
                    <Timer color="#0D4A48" size={16} />
                    <Text style={styles.timerText}>EXPIRA EN {formatTime(timer)}</Text>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
