import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StatusBar, ActivityIndicator, Image } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, Mail, Lock, ShieldCheck, Zap, Trophy } from "lucide-react-native";
import { get_loginStyles } from "../styles/loginStyles";
import { useAppTheme } from '../context/ThemeContext';
import axios from "axios";
import { config } from "../config/api";
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen() {
    const { theme } = useAppTheme();
    const styles = get_loginStyles(theme);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    
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
            const response = await axios.post(`${config.BASE_URL}/auth/register`, {
                name,
                email,
                password
            });
            const { token, user } = response.data;
            if (token) {
                await SecureStore.setItemAsync('token', token);
            }

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen', params: { user } }],
                })
            );
        } catch (error) {
            alert('Registration failed. Please try again.');
            console.error("Error during registration:", error);
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
                            source={require('../../assets/logo.png')} 
                            style={{ width: 100, height: 100, borderRadius: 16 }} 
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.registerHeaderTitle}>Engli-Cards</Text>
                    <Text style={styles.registerHeaderSubtitle}>Join the luminous circle of scholars</Text>
                </View>

                {/* Main Form Card */}
                <View style={styles.registerCard}>
                    <Text style={styles.registerCardTitle}>Sign up</Text>
                    <Text style={styles.registerCardSubtitle}>Start your daily learning journey today.</Text>

                    {/* Full Name */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Full name</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <User color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor={theme.colors.mutedForeground}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Email Address</Text>
                    <View style={styles.registerFlatInputContainer}>
                        <Mail color={theme.colors.mutedForeground} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@email.com"
                            placeholderTextColor={theme.colors.mutedForeground}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Password</Text>
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

                    {/* Confirm Password */}
                    <Text style={[styles.fieldLabel, { textTransform: 'none', letterSpacing: 0 }]}>Confirm Password</Text>
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

                    {/* Submit Button */}
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
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Register</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Footer Inside Card */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <Text style={styles.resetFooterText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.resetFooterLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Blocks */}
                <View style={styles.infoBlocksContainer}>
                    <View style={[styles.infoBlock, styles.infoBlockLeft]}>
                        <Zap color={theme.colors.primary} size={20} />
                        <Text style={styles.infoBlockTitle}>ADAPTIVE</Text>
                        <Text style={styles.infoBlockText}>Smart flashcards that learn your pace.</Text>
                    </View>
                    <View style={[styles.infoBlock, styles.infoBlockRight]}>
                        <Trophy color={theme.colors.primary} size={20} />
                        <Text style={styles.infoBlockTitle}>REWARDING</Text>
                        <Text style={styles.infoBlockText}>Earn gems for every vocabulary master.</Text>
                    </View>
                </View>

                {/* Bottom Links */}
                <View style={styles.bottomLinksRow}>
                    <TouchableOpacity>
                        <Text style={styles.bottomLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.bottomLink}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}