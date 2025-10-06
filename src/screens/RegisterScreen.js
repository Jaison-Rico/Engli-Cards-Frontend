import style1 from "../styles/styles1";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import axios from "axios";
import { config } from "../config/api";
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen() {
    const navigation = useNavigation(); 
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        // Lógica de registro

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            
            console.log("Registering user with: - RegisterScreen.js:31", { name, email, password });
            const response = await axios.post(`${config.BASE_URL}/auth/register`, {
                name,
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
            );
        } catch (error) {
            alert('Registration failed. Please try again.');
            console.error("Error during registration: - RegisterScreen.js:51", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={style1.container}>
            <View style={style1.containerRegister}>
                <Text style={style1.titles}>Sign up</Text>
                <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                    <Text style={style1.labelFloating}>Full name</Text>
                    <TextInput style={style1.inputsRegister} value={name} onChangeText={setName} placeholder="Pepito Perez" />
                </View>

                <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                    <Text style={style1.labelFloating}>Email Address</Text>
                    <TextInput style={style1.inputsRegister} value={email} onChangeText={setEmail} placeholder="abc@email.com" keyboardType="email-address" />
                </View>

                <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                    <Text style={style1.labelFloating}>Password</Text>
                    <TextInput style={style1.inputsRegister} value={password} onChangeText={setPassword} placeholder="*******" secureTextEntry />
                </View>

                <View style={{ position: 'relative', marginVertical: 10, width: '100%' }}>
                    <Text style={style1.labelFloating}>Confirm Password</Text>
                    <TextInput style={style1.inputsRegister} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="*******" secureTextEntry />
                </View>
            </View>
            <View>
                <TouchableOpacity style={style1.buttons} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={style1.textLogin}>Register</Text>}
                </TouchableOpacity>
            </View>
        </View>
    )

}