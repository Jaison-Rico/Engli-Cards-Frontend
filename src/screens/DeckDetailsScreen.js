import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MoreVertical, Edit2, Share2, Volume2, ChevronRight, Plus, Image as ImageIcon, Search } from "lucide-react-native";
import axios from "axios";
import { config } from "../config/api";
import * as SecureStore from 'expo-secure-store';
import * as Speech from 'expo-speech';

// Mockup styling details
const colors = {
  headerBg: "#E6F9F9",
  white: "#FFFFFF",
  primaryText: "#08302E",
  primarySoftText: "#4A6E6C",
  accent: "#12B5B0", 
  lightCyan: "#CFF5F2",
  grayBorder: "#F0F0F0",
  newBadgeBg: "#E0F2F1",
  newBadgeText: "#00695C"
};

export default function DeckDetailsScreen({ route, navigation }) {
    const { deck } = route.params; 
    const insets = useSafeAreaInsets();
    
    // Data State
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deckName, setDeckName] = useState(deck.deck_name || "Mazo");

    // UI Features State
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editNameInput, setEditNameInput] = useState(deckName);

    useFocusEffect(
        useCallback(() => {
            fetchFlashcards();
        }, [])
    );

    const fetchFlashcards = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const resp = await axios.get(`${config.BASE_URL}/decks/${deck.deck_id}/flashcards`, { headers });
            setFlashcards(resp.data);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las flashcards.");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        console.log("share clicked"); 
    };

    const handleSpeak = (word) => {
        if (!word) return;
        Speech.stop();
        Speech.speak(word, { language: 'en-US', pitch: 1.0, rate: 1.0 });
    };

    // EDICIÓN / ELIMINACIÓN DE MAZO
    const handleSaveDeckName = async () => {
        if(!editNameInput.trim()) return;
        try {
            const token = await SecureStore.getItemAsync('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            let userStr = await SecureStore.getItemAsync('userInfo');
            let parsedUser = userStr ? JSON.parse(userStr) : null;
            const userId = parsedUser?.user_id ?? parsedUser?._id ?? parsedUser?.id ?? parsedUser?.userId ?? deck.user_id;

            if (!userId) {
                Alert.alert("Error", "No se encontró tu ID de usuario.");
                return;
            }

            await axios.patch(`${config.BASE_URL}/decks/${deck.deck_id}`, {
                name: editNameInput,
                userId: userId
            }, { headers });

            setDeckName(editNameInput);
            setEditModalVisible(false);
            Alert.alert("Éxito", "Mazo actualizado correctamente");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo actualizar el mazo");
        }
    };

    const handleDeleteDeck = () => {
        Alert.alert(
            "Eliminar Mazo",
            "¿Estás seguro que deseas eliminar este mazo? También se eliminarán las palabras asociadas.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('token');
                            const headers = token ? { Authorization: `Bearer ${token}` } : {};
                            let userStr = await SecureStore.getItemAsync('userInfo');
                            let parsedUser = userStr ? JSON.parse(userStr) : null;
                            const userId = parsedUser?.user_id ?? parsedUser?._id ?? parsedUser?.id ?? parsedUser?.userId ?? deck.user_id;
                            
                            if (!userId) {
                                Alert.alert("Error", "No se encontró tu ID de usuario.");
                                return;
                            }

                            await axios.delete(`${config.BASE_URL}/decks?deckId=${deck.deck_id}&userId=${userId}`, { headers });
                            Alert.alert("Éxito", "Mazo eliminado correctamente", [
                                { text: "OK", onPress: () => {
                                    setEditModalVisible(false);
                                    navigation.goBack();
                                }}
                            ]);
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "No se pudo eliminar el mazo");
                        }
                    }
                }
            ]
        );
    };

    // BUSCADOR
    const filteredCards = flashcards.filter(card => 
        card.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
        card.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.cardContainer} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('UpdateFlashCard', { card: item })}
        >
            <View style={styles.cardImageContainer}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.cardImage} />
                ) : (
                    <ImageIcon color="#A1CFC9" size={24} />
                )}
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardWord}>{item.word}</Text>
                <Text style={styles.cardTranslation}>{item.translation}</Text>
            </View>
            
            <TouchableOpacity onPress={() => handleSpeak(item.word)} style={styles.volumeButton}>
                <Volume2 color="#A1A1A1" size={20} />
            </TouchableOpacity>
            
            <View style={styles.chevronContainer}>
                <ChevronRight color="#D1D1D1" size={20} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Modal de edición */}
            <Modal
                transparent={true}
                visible={isEditModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Mazo</Text>
                        
                        <Text style={styles.modalLabel}>Nuevo Nombre:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editNameInput}
                            onChangeText={setEditNameInput}
                            placeholder="Ej. Frutas"
                        />

                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleSaveDeckName}>
                            <Text style={styles.modalBtnPrimaryText}>Guardar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalBtnDestructive} onPress={handleDeleteDeck}>
                            <Text style={styles.modalBtnDestructiveText}>Eliminar Mazo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* HEADER AREA */}
            <View style={[styles.headerArea, { paddingTop: insets.top + 20 }]}>
                {/* Navbar */}
                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft color={colors.primaryText} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.navbarTitle}>Mazo de Estudio</Text>
                    <TouchableOpacity>
                        <MoreVertical color={colors.primaryText} size={24} />
                    </TouchableOpacity>
                </View>

                {/* Info Container */}
                <View style={styles.infoContainer}>
                    <View style={styles.pillContainer}>
                        <Text style={styles.pillText}>VOCABULARY SET</Text>
                    </View>
                    <Text style={styles.deckTitle}>{deckName}</Text>
                    <Text style={styles.deckSubtitle}>{flashcards.length || deck.cardCount || 0} Tarjetas en este mazo</Text>
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setEditModalVisible(true)}>
                            <Edit2 color={colors.primaryText} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Share2 color={colors.primaryText} size={18} />
                        </TouchableOpacity>

                        {flashcards.length >= 5 && (
                            <TouchableOpacity 
                                style={[styles.actionButton, { backgroundColor: colors.accent, width: 140, borderRadius: 10, flexDirection: 'row' }]} 
                                onPress={() => navigation.navigate('DeckQuiz', { deckId: deck.deck_id, deckName: deckName })}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, marginRight: 8 }}>Practicar Quiz</Text>
                                <ChevronRight color="#FFF" size={16} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* LIST AREA */}
            <View style={styles.listArea}>
                <View style={styles.listHeaderRow}>
                    <Text style={styles.listTitle}>Lista de Flashcards</Text>
                    <Text style={styles.listSubtitle}>Ordenar por: Recientes</Text>
                </View>

                {/* Barra de Búsqueda */}
                <View style={styles.searchContainer}>
                    <Search color={colors.primarySoftText} size={20} />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Buscar flashcard..." 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.primarySoftText}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <FlatList
                        data={filteredCards}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        renderItem={renderCard}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <Text style={styles.emptyText}>No se encontraron resultados.</Text>
                        )}
                        ListFooterComponent={() => (
                            <TouchableOpacity 
                                style={styles.addMoreCard} 
                                onPress={() => navigation.navigate('NewFlashCard', { deckId: deck.deck_id })}
                            >
                                <View style={styles.plusCircle}>
                                    <Plus color={colors.primaryText} size={24} />
                                </View>
                                <Text style={styles.addMoreTitle}>¿Quieres añadir más?</Text>
                                <Text style={styles.addMoreSubtitle}>Sigue ampliando tu vocabulario agregando nuevas tarjetas.</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    headerArea: {
        backgroundColor: colors.headerBg,
        paddingHorizontal: 20,
        paddingBottom: 25,
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
    },
    navbarTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.primaryText,
    },
    infoContainer: {
        alignItems: "flex-start",
    },
    pillContainer: {
        backgroundColor: colors.lightCyan,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10,
    },
    pillText: {
        color: colors.accent,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    deckTitle: {
        fontSize: 34,
        fontWeight: "bold",
        color: colors.primaryText,
        marginBottom: 5,
    },
    deckSubtitle: {
        fontSize: 16,
        color: colors.primarySoftText,
        marginBottom: 15,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        backgroundColor: colors.lightCyan,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    listArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    listHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.primaryText,
    },
    listSubtitle: {
        fontSize: 12,
        color: colors.primarySoftText,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayBorder,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 45
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: colors.primaryText,
    },
    flatListContent: {
        paddingBottom: 100, 
    },
    cardContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 15,
        marginBottom: 10,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2, 
        borderWidth: 1,
        borderColor: colors.grayBorder
    },
    cardImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
        overflow: 'hidden'
    },
    cardImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },
    cardTextContainer: {
        flex: 1,
    },
    cardWord: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.primaryText,
    },
    cardTranslation: {
        fontSize: 14,
        color: colors.primarySoftText,
    },
    volumeButton: {
        padding: 10,
    },
    chevronContainer: {
        padding: 5,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
    emptyText: {
        textAlign: "center",
        color: colors.primarySoftText,
        marginTop: 20,
        fontStyle: "italic"
    },
    

    addMoreCard: {
        width: "100%",
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.lightCyan,
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 50
    },
    plusCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.lightCyan,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    addMoreTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.primaryText,
        marginBottom: 5,
    },
    addMoreSubtitle: {
        fontSize: 12,
        color: colors.primarySoftText,
        textAlign: "center",
        paddingHorizontal: 10,
    },
    studyButton: {
        backgroundColor: colors.accent,
        width: "70%",
        height: 55,
        borderRadius: 30,
        position: 'absolute',
        bottom: 10, 
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    studyButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "bold"
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primaryText,
        marginBottom: 15,
        textAlign: 'center'
    },
    modalLabel: {
        fontSize: 14,
        color: colors.primarySoftText,
        marginBottom: 5,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.grayBorder,
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 45,
        fontSize: 16,
        color: colors.primaryText,
        marginBottom: 20,
        backgroundColor: '#FCFCFC'
    },
    modalBtnPrimary: {
        backgroundColor: colors.accent,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalBtnPrimaryText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBtnDestructive: {
        backgroundColor: '#FFEAEA',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalBtnDestructiveText: {
        color: '#D32F2F',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBtnCancel: {
        backgroundColor: colors.grayBorder,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalBtnCancelText: {
        color: colors.primarySoftText,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
