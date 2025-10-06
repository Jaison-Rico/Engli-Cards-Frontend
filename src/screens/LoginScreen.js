import { useNavigation } from '@react-navigation/native';
import style1 from '../styles/styles1';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "react-native";
import { config } from '../config/api';
import axios from 'axios';
import { useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store'; 


export default function LoginScreen() {
    const navigation = useNavigation(); //obtiene la función de navegación

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
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
            }
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen', params: { user } }],
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
                console.error('API error - LoginScreen.js:57', status, error.response.data);
            } else {
                alert(serverMessage || `Error ${status}`);
            }

        } finally {
            setLoading(false);
        }
    }


    return (
        <View style={style1.container}>
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
                <TouchableOpacity onPress={handleLogin} style={style1.buttons} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> :<Text style={style1.textLogin}>Login</Text>}
                </TouchableOpacity>
            </View>
        </View>
    )
}