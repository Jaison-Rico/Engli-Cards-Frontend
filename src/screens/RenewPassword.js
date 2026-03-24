import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { config } from '../config/api';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Send, RotateCcw } from "lucide-react-native";
import { loginStyles as styles } from "../styles/loginStyles";

export default function RenewPassword() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!email) {
            alert("Por favor ingresa tu correo");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${config.BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                navigation.navigate("OtpVerification", { email });
            } else {
                alert(data.message || "Error al enviar el código");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: '#ffffff' }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView 
                contentContainerStyle={[
                    styles.resetContainer,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Top Nav */}
                <View style={styles.resetNavRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ArrowLeft color="#0D4A48" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.resetNavTitle}>Engli-Cards</Text>
                </View>

                {/* Highlight Card */}
                <View style={styles.resetHighlightCard}>
                    <View style={styles.resetIconCircle}>
                        <RotateCcw color="#006386" size={32} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.resetCardTitle}>Reset Password</Text>
                    <Text style={styles.resetCardSubtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>
                </View>

                {/* Email Input */}
                <View style={styles.resetFieldGroup}>
                    <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                    <View style={styles.inputContainer}>
                        <Mail color="#527F7C" size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="name@example.com"
                            placeholderTextColor="#CBEBE8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    onPress={handleSend}
                    style={styles.loginButton}
                    activeOpacity={0.85}
                >
                    <View style={styles.loginButtonContent}>
                        <Text style={styles.loginButtonText}>Send</Text>
                        <Send color="#ffffff" size={18} style={{ marginLeft: 8 }} />
                    </View>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.resetFooterRow}>
                    <Text style={styles.resetFooterText}>Remember your password?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.resetFooterLink}>Log In</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}