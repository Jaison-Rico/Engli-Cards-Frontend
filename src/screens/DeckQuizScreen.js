import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Quiz from '../components/Quiz';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import { config } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function DeckQuizScreen({ route, navigation }) {
    const { deckId, deckName } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState(null);

    const primaryColor = theme.colors.primaryLight || theme.colors.primary;

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            const res = await fetch(`${config.BASE_URL}/decks/${deckId}/quiz`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Error al generar el quiz');
            }

            const data = await res.json();
            setQuizData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={styles.loadingText}>Generando tu Quiz...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={[styles.backBtn, { backgroundColor: primaryColor }]} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Quiz 
                questions={quizData}
                heading={deckName}
                onBack={() => navigation.goBack()}
                instructionText="Selecciona la traducción correcta"
                onFinish={(score, total) => {
                    console.log(`Quiz finalizado: ${score}/${total}`);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: theme.colors.mutedForeground,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    backBtn: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    backBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
