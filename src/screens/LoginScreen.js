
import style1 from '../styles/styles1';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "react-native";
import { config } from '../config/api';
import axios from 'axios';
import { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets  } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';


export default function LoginScreen() {
    const navigation = useNavigation(); //obtiene la función de navegación
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
                // Guarda el token de manera segura
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
            const status = error.response.status;
            const serverMessage = error.response.data?.message || '';
            if (status === 400) {
                alert(serverMessage || 'Solicitud inválida. Revisa los campos.');
            } else if (status === 401) {
                alert(serverMessage || 'No autorizado. Revisa tus credenciales.');
            } else if (status === 404) {
                // Aquí es donde quieres mostrar que las credenciales no existen
                alert(serverMessage || 'Credenciales incorrectas. Usuario no encontrado (404).');
            } else if (status >= 500) {
                alert('Error del servidor. Intenta más tarde. xd');
                console.error('API error - LoginScreen.js:72', status, error.response.data);
            } else {
                alert(serverMessage || `Error ${status}`);
            }

        } finally {
            setLoading(false);
        }
    }


    return (    
            <View style={{ ...style1.container, marginTop: insets.top, marginBottom: insets.bottom  }}>
                <Image source={require('../images/logo.png')}
                    style={{ width: 150, height: 150, marginBottom: 2, marginTop: 0 }}
                />

                <Text style={style1.titles}>Login</Text>

                <View style={style1.containerLogin}>

                    <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                        <Text style={style1.labelFloating}>Email Address</Text>
                        <TextInput style={style1.inputsLogin}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="abc@example.com" keyboardType="email-address" />
                    </View>

                    <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                        <Text style={style1.labelFloating}>Password</Text>
                        <TextInput style={style1.inputsLogin}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="*******"
                            secureTextEntry />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%' }}>
                        <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")} style={style1.textButton}>
                            <Text style={style1.textButtonLogin}>Forgot password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={style1.textButton}>
                            <Text style={style1.textButtonLogin}>Create an account</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View>
                    <TouchableOpacity onPress={handleLogin} style={[style1.buttons , {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}]} disabled={loading}>
                        <User color="#ffffffff" size={24} style={{ marginRight: 8 }} />
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={style1.textLogin}>Login</Text>}
                    </TouchableOpacity>
                </View>

                <View style={style1.dividerContainer}>
                    <View style={style1.dividerLine} />
                    <Text style={style1.dividerText}>Or</Text>
                    <View style={style1.dividerLine} />
                </View> 

                <View style={{ marginTop: 0, marginBottom: 40 }}>
                    <FontAwesome name="google" size={40} color="#584fd6ff" />
                </View>
                    
                <View>
                    <Text style={style1.footerText}>© 2025 Engli Cards. All rights reserved.</Text>
                </View>
            </View>
    )
}