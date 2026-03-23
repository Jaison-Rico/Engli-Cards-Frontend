
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { config } from '../config/api';
import axios from 'axios';
import { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { loginStyles as styles } from '../styles/loginStyles';

export default function LoginScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        // test login solo para entorno de desarrollo sin api
        if (email === "" && password === "") {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabs', params: { user: { name: "Test User", email: "test@example.com" } } }],
                })
            )
            await SecureStore.setItemAsync('token', 'test-token');
            await SecureStore.setItemAsync('userInfo', JSON.stringify({ name: "Test User", email: "test@example.com" }));
        }
        // validacion basica
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.BASE_URL}/auth/login`, {
                email,
                password
            });
            const { token, user } = response.data;
            if (token) {
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
            }
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabs', params: { user, token } }],
                })
            )
        } catch (error) {
            console.log(error)
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message || '';

            if (!error.response) {
                alert('No se pudo conectar con el servidor. Verifica que el backend esté encendido y que celular y PC estén en la misma red.');
                return;
            }

            if (status === 400) {
                alert(serverMessage || 'Solicitud inválida. Revisa los campos.');
            } else if (status === 401) {
                alert(serverMessage || 'No autorizado. Revisa tus credenciales.');
            } else if (status === 404) {
                alert(serverMessage || 'Credenciales incorrectas. Usuario no encontrado (404).');
            } else if (status >= 500) {
                alert('Error del servidor. Intenta más tarde.');
                console.error('API error - LoginScreen.js', status, error.response.data);
            } else {
                alert(serverMessage || `Error ${status}`);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5F0" />
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContainer,
                    { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header - Logo & Title */}
                <View style={styles.headerSection}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../../assets/logo.png')} 
                            style={{ width: 100, height: 100, borderRadius: 16 }} 
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appTitle}>Engli-Cards</Text>
                    <Text style={styles.appSubtitle}>Elevate your English with every card.</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>Welcome back</Text>

                    {/* Email Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                        <View style={styles.inputContainer}>
                            <Mail color="#527F7C" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@example.com"
                                placeholderTextColor="#CBEBE8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.passwordLabelRow}>
                            <Text style={styles.fieldLabel}>PASSWORD</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Lock color="#527F7C" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#CBEBE8"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? (
                                    <EyeOff color="#527F7C" size={18} />
                                ) : (
                                    <Eye color="#527F7C" size={18} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
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
                                <Text style={styles.loginButtonText}>Login</Text>
                                <LogIn color="#fff" size={18} style={{ marginLeft: 8 }} />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity style={styles.googleButton} activeOpacity={0.7}>
                        <FontAwesome name="google" size={18} color="#4285F4" style={{ marginRight: 10 }} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.footerLink}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}