import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Quiz from '../../components/Quiz';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeckQuiz } from '../../services/decks.service';
import { useAppTheme } from '../../context/ThemeContext';

export default function DeckQuizScreen({ route, navigation }) {
    const { theme } = useAppTheme();
    const { deckId, deckName } = route.params;
    const insets = useSafeAreaInsets();
    const styles = get_styles(theme);
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
            const data = await getDeckQuiz(deckId);
            setQuizData(data);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
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
                deckId={deckId}
                onBack={() => navigation.goBack()}
                instructionText="Selecciona la traducción correcta"
                onFinish={(score, total) => {
                    console.log(`Quiz finalizado: ${score}/${total}`);
                }}
            />
        </View>
    );
}

const get_styles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
