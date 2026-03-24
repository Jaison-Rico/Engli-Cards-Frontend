import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StatusBar } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { config } from '../config/api';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, RotateCcw } from "lucide-react-native";
import { loginStyles as styles } from "../styles/loginStyles";

export default function NewPasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { resetToken } = route.params || { resetToken: "" };

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
            alert("La contraseña debe tener al menos 8 caracteres");
            return;
        }
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch(`${config.BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Contraseña actualizada con éxito!");
                navigation.navigate("Login");
            } else {
                alert(data.message || "Error al restablecer la contraseña");
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
                    styles.resetContainer,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, backgroundColor: '#E8F5F0' }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Nav */}
                <View style={styles.resetNavRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft color="#0D4A48" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.resetNavTitle}>Reset Password</Text>
                </View>

                {/* Illustration Icon */}
                <View style={[styles.resetIconCircle, { marginTop: 20 }]}>
                    <RotateCcw color="#00BFA5" size={32} />
                </View>

                {/* Titles */}
                <Text style={[styles.otpTitle, { marginTop: 24 }]}>Nueva Contraseña</Text>
                <Text style={styles.otpSubtitle}>
                    Escribe tu nueva contraseña para acceder a tu cuenta.
                </Text>

                {/* Password Input */}
                <View style={styles.resetFieldGroup}>
                    <Text style={styles.fieldLabel}>Escriba contraseña</Text>
                    <View style={styles.inputContainer}>
                        <Lock color="#527F7C" size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="********"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff color="#527F7C" size={20} /> : <Eye color="#527F7C" size={20} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.resetFieldGroup}>
                    <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
                    <View style={styles.inputContainer}>
                        <ShieldCheck color="#527F7C" size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="********"
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                            {showConfirm ? <EyeOff color="#527F7C" size={20} /> : <Eye color="#527F7C" size={20} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Strength Indicator */}
                <View style={styles.strengthContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={[styles.strengthBar, strength >= i ? styles.strengthBarActive : null]} />
                    ))}
                </View>
                <Text style={styles.passwordHint}>Usa al menos 8 caracteres con letras y números.</Text>

                {/* Change Button */}
                <TouchableOpacity
                    onPress={handleReset}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Cambiar</Text>
                </TouchableOpacity>

                {/* Help Footer */}
                <TouchableOpacity style={{ marginTop: 40 }}>
                    <Text style={{ color: '#0D4A48', fontWeight: '700', fontSize: 14 }}>
                        ¿Necesitas ayuda con tu cuenta?
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
