import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StatusBar, ActivityIndicator, Image } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, Mail, Lock, ShieldCheck, Zap, Trophy } from "lucide-react-native";
import { get_loginStyles } from "../../styles/auth.styles";
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/auth.service';

export default function RegisterScreen() {
    const { theme } = useAppTheme();
    const styles = get_loginStyles(theme);
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
            alert("Passwords do not match");
            return;
        }

        if (!name || !email || !password) {
            alert("Please fill all fields");
            return;
        }
        
        setLoading(true);

        try {
            const { token, user } = await registerUser(name, email, password);
            await login(token, user);
            navigation.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs' }] })
            );
        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.message;
            if (status === 400) {
                alert(msg || 'Datos inválidos. Verifica que el correo sea válido y la contraseña tenga al menos 4 caracteres.');
            } else if (status === 429) {
                alert('Demasiados intentos. Espera un momento y vuelve a intentarlo.');
            } else if (!error.response) {
                alert('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                alert(msg || 'No se pudo completar el registro. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: theme.colors.background }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar 
                barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} 
                backgroundColor={theme.colors.background} 
            />
            <ScrollView 
                contentContainerStyle={[
                    styles.resetContainer, // Reusing base layout container
                    { backgroundColor: theme.colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.registerHeader}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../../../assets/logo.png')} 
                            style={{ width: 100, height: 100, borderRadius: 16 }} 
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.registerHeaderTitle}>Engli-Cards</Text>
                    <Text style={styles.registerHeaderSubtitle}>Tu viaje al inglés empieza aquí</Text>
                </View>

                {/* Main Form Card */}
                <View style={styles.registerCard}>
                    <Text style={styles.registerCardTitle}>Crear cuenta</Text>
                    <Text style={styles.registerCardSubtitle}>Empieza tu rutina de aprendizaje diario.</Text>

                    {/* Nombre */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Nombre completo</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <User color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ingresa tu nombre"
                            placeholderTextColor={theme.colors.mutedForeground}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Correo */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Correo electrónico</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <Mail color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor={theme.colors.mutedForeground}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Contraseña */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Contraseña</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <Lock color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.mutedForeground}
                            secureTextEntry
                        />
                    </View>

                    {/* Confirmar contraseña */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Confirmar contraseña</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <ShieldCheck color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.mutedForeground}
                            secureTextEntry
                        />
                    </View>

                    {/* Botón */}
                    <TouchableOpacity
                        onPress={handleRegister}
                        style={styles.loginButton}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Registrarse</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <Text style={styles.resetFooterText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.resetFooterLink}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Blocks */}
                <View style={styles.infoBlocksContainer}>
                    <View style={[styles.infoBlock, styles.infoBlockLeft]}>
                        <Zap color={theme.colors.primary} size={20} />
                        <Text style={styles.infoBlockTitle}>ADAPTIVO</Text>
                        <Text style={styles.infoBlockText}>Tarjetas que aprenden a tu ritmo.</Text>
                    </View>
                    <View style={[styles.infoBlock, styles.infoBlockRight]}>
                        <Trophy color={theme.colors.primary} size={20} />
                        <Text style={styles.infoBlockTitle}>RECOMPENSAS</Text>
                        <Text style={styles.infoBlockText}>Gana puntos por cada nivel dominado.</Text>
                    </View>
                </View>

                {/* Bottom Links */}
                <View style={styles.bottomLinksRow}>
                    <TouchableOpacity>
                        <Text style={styles.bottomLink}>Privacidad</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.bottomLink}>Términos de uso</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}