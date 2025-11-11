// 1) Importamos React y estado local para manejar el texto y el estado "hablando".
import React, { useState } from 'react';
// 2) Importamos componentes básicos de UI de React Native.
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// 3) Importamos el módulo de texto a voz (TTS) de Expo.
import * as Speech from 'expo-speech';

export default function SimpleSpeechDemo() {
    // 4) Texto que diremos con TTS; por defecto algo simple.
    const [text, setText] = useState('Hello world');
    // 5) Estado para saber si el motor está hablando (útil para deshabilitar botones/mostrar estado).
    const [speaking, setSpeaking] = useState(false);

    // 6) Función para hablar en inglés (en-US).
    const speakEnglish = () => {
        // 7) Detenemos cualquier reproducción anterior para evitar solapamientos.
        Speech.stop();
        // 8) Llamamos a Speech.speak con el texto y opciones.
        Speech.speak(text, {
            language: 'en-US',   // 9) Idioma/acentos (ISO). Cambia a 'es-ES' para español de España, etc.
            rate: 1.0,           // 10) Velocidad de habla (0.1 a 1.5 aprox según dispositivo).
            pitch: 1.0,          // 11) Tono (0.5 grave, 2.0 agudo, depende del SO).
            // 12) Callbacks opcionales para controlar UI.
            onStart: () => setSpeaking(true),
            onDone: () => setSpeaking(false),
            onStopped: () => setSpeaking(false),
            onError: () => setSpeaking(false),
        });
    };

    // 13) Función para hablar en español (es-ES).
    const speakSpanish = () => {
        Speech.stop();
        Speech.speak(text, {
            language: 'es-ES',
            rate: 1.0,
            pitch: 1.0,
            onStart: () => setSpeaking(true),
            onDone: () => setSpeaking(false),
            onStopped: () => setSpeaking(false),
            onError: () => setSpeaking(false),
        });
    };

    // 14) Detener manualmente si el usuario lo pide.
    const stop = () => {
        Speech.stop();
        setSpeaking(false);
    };

    // 15) UI muy simple: un input y tres botones.
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Demo expo-speech</Text>

            <TextInput
                style={styles.input}
                value={text}                 // 16) Texto actual a pronunciar
                onChangeText={setText}       // 17) Actualiza el estado al escribir
                placeholder="Escribe algo..."
            />

            <View style={styles.row}>
                <TouchableOpacity style={styles.btn} onPress={speakEnglish} disabled={speaking || !text}>
                    <Text style={styles.btnText}>{speaking ? 'Hablando…' : 'Hablar EN'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={speakSpanish} disabled={speaking || !text}>
                    <Text style={styles.btnText}>{speaking ? 'Hablando…' : 'Hablar ES'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.stop]} onPress={stop} disabled={!speaking}>
                    <Text style={styles.btnText}>Detener</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 18) Estilos básicos (sin importancia para TTS, solo UI).
const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#0f172a' },
    title: { color: 'white', fontSize: 20, marginBottom: 12 },
    input: { width: '100%', maxWidth: 420, backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 8 },
    btn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
    stop: { backgroundColor: '#ef4444' },
    btnText: { color: 'white', fontWeight: '600' },
});