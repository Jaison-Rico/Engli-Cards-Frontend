import { View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, ScrollView } from "react-native";
import stylesNFC from "../styles/styleNFC";
import { Picker } from '@react-native-picker/picker'; //componente para crear listas desplegables
import { Camera, Save, ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react-native'; //import de icons
import React, { useState, useEffect } from 'react';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../config/api';

export default function NewFlashCard() {
    const navigation = useNavigation();
    const [selectedMazo, setSelectedMazo] = useState("");
    // iOS: mostramos un Modal con el wheel y evitamos romper el layout
    const [iosPickerVisible, setIosPickerVisible] = useState(false);
    const [tempMazo, setTempMazo] = useState("");
    const [englishWord, setEnglishWord] = useState("");
    const [spanishTranslation, setSpanishTranslation] = useState("");

    // Estados para los mazos dinámicos del backend
    const [decks, setDecks] = useState([]);
    const [loadingDecks, setLoadingDecks] = useState(false);
    const [error, setError] = useState(null);
    
    // Estado para el modal de éxito
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [creatingFlashcard, setCreatingFlashcard] = useState(false);

    // Cargar los mazos del usuario desde el backend
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const fetchDecks = async () => {
                setLoadingDecks(true);
                setError(null);
                try {
                    // Obtener el userInfo desde SecureStore
                    const storedUser = await SecureStore.getItemAsync('userInfo');
                    if (!storedUser) {
                        if (isActive) {
                            setError('No se encontró información del usuario. Inicia sesión nuevamente.');
                            setDecks([]);
                        }
                        return;
                    }

                    const user = JSON.parse(storedUser);
                    const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

                    if (!userId) {
                        if (isActive) {
                            setError('No se encontró el ID de usuario.');
                            setDecks([]);
                        }
                        return;
                    }

                    // Obtener token si existe
                    const token = await SecureStore.getItemAsync('token');
                    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

                    // Llamada al backend para obtener los mazos
                    const url = `${config.BASE_URL}/decks/${userId}`;
                    const resp = await axios.get(url, { headers });
                    const data = Array.isArray(resp.data) ? resp.data : (resp.data?.decks ?? []);

                    if (isActive) {
                        // Normalizar los mazos
                        const normalizedDecks = data.map((d) => ({
                            deck_id: d.deck_id ?? d.id ?? d._id ?? d.deckId,
                            deck_name: d.deck_name ?? d.name ?? d.title ?? 'Deck sin nombre'
                        }));
                        setDecks(normalizedDecks);
                    }
                } catch (err) {
                    const serverMessage = err?.response?.data?.message || err?.message || 'Error al cargar mazos';
                    if (isActive) {
                        setError(serverMessage);
                        setDecks([]);
                    }
                } finally {
                    if (isActive) setLoadingDecks(false);
                }
            };

            fetchDecks();

            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleCreateFlashCard = async () => {
        if (!englishWord.trim() || !spanishTranslation.trim() || !selectedMazo) {
            setError('Por favor, completa todos los campos obligatorios.');
            return;
        }

        setCreatingFlashcard(true);
        setError(null);

        try {
            const storedUser = await SecureStore.getItemAsync('userInfo');
            const user = JSON.parse(storedUser);
            const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
            
            const response = await axios.post(`${config.BASE_URL}/flashcards`, {
                word: englishWord,
                translation: spanishTranslation,
                image_url: "http://example.com/image.jpg",
                user_id: +userId,
                deck_id: +selectedMazo
            });
            
            console.log('Flashcard created successfully: - NewFlashCard.js:117', response.data);
            
            // Mostrar modal de éxito
            setSuccessModalVisible(true);
            
            // Esperar 2 segundos y luego navegar hacia atrás
            setTimeout(() => {
                setSuccessModalVisible(false);
                navigation.goBack();
            }, 2000);
            
        } catch (error) {
            console.error('Error creating flashcard: - NewFlashCard.js:129', error);
            setError(error?.response?.data?.message || 'Error al crear la flashcard. Intenta de nuevo.');
        } finally {
            setCreatingFlashcard(false);
        }
    }


    return (
            <View >
                <View style={stylesNFC.container}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft />
                    </TouchableOpacity>
                    <Text style={stylesNFC.titlesNFC}>NewFlashCard</Text>
                </View>
                <View style={stylesNFC.containerCreateFC}>
                    <Text style={stylesNFC.subtitlesNFC}>Crear nueva tarjeta</Text>

                    <View>
                        <Text style={stylesNFC.textsNFC}>Palabra en Inglés *</Text>
                        <TextInput
                            style={stylesNFC.inputs}
                            placeholder="ej. Apple"
                            value={englishWord}
                            onChangeText={setEnglishWord}
                        />
                        <Text style={stylesNFC.textsNFC}>Traducción en Español *</Text>
                        <TextInput
                            style={stylesNFC.inputs}
                            placeholder="ej. Manzana"
                            value={spanishTranslation}
                            onChangeText={setSpanishTranslation}
                        />
                        <Text style={stylesNFC.textsNFC}>Seleccionar un Mazo *</Text>
                        {loadingDecks ? (
                            <View style={stylesNFC.inputs}>
                                <ActivityIndicator size="small" color="#111a2e" />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={stylesNFC.iosPickerTouchable}
                                onPress={() => {
                                    if (decks.length > 0) {
                                        setTempMazo(selectedMazo || String(decks[0].deck_id));
                                        setIosPickerVisible(true);
                                    }
                                }}
                                disabled={decks.length === 0}
                            >
                                <View style={stylesNFC.iosPickerRow}>
                                    <Text style={!selectedMazo ? stylesNFC.iosPlaceholder : stylesNFC.iosPickerText}>
                                        {selectedMazo
                                            ? decks.find(d => String(d.deck_id) === selectedMazo)?.deck_name || 'Mazo seleccionado'
                                            : (decks.length > 0 ? 'Elige un mazo...' : 'No hay mazos disponibles')
                                        }
                                    </Text>
                                    <ChevronDown color="#111a2e" size={20} />
                                </View>
                            </TouchableOpacity>
                        )}
                        {error && <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{error}</Text>}

                        <Modal visible={iosPickerVisible} transparent animationType="slide" onRequestClose={() => setIosPickerVisible(false)}>
                            <TouchableOpacity
                                style={stylesNFC.modalBackdrop}
                                activeOpacity={1}
                                onPress={() => setIosPickerVisible(false)}
                            >
                                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                                    <View style={stylesNFC.modalSheet}>
                                        <Text style={stylesNFC.modalTitle}>Seleccionar un Mazo</Text>
                                        {decks.length === 0 ? (
                                            <Text style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                                                No tienes mazos disponibles. Crea uno primero.
                                            </Text>
                                        ) : Platform.OS === 'ios' ? (
                                            <Picker
                                                selectedValue={tempMazo}
                                                style={stylesNFC.picker}
                                                itemStyle={stylesNFC.pickerItemStyle}
                                                onValueChange={(val) => setTempMazo(val)}
                                            >
                                                {decks.map((deck) => (
                                                    <Picker.Item
                                                        key={deck.deck_id}
                                                        label={deck.deck_name}
                                                        value={String(deck.deck_id)}
                                                    />
                                                ))}
                                            </Picker>
                                        ) : (
                                            <ScrollView
                                                style={{ maxHeight: 300 }}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                <View style={stylesNFC.androidModalList}>
                                                    {decks.map((deck) => (
                                                        <TouchableOpacity
                                                            key={deck.deck_id}
                                                            style={[
                                                                stylesNFC.androidModalOption,
                                                                tempMazo === String(deck.deck_id) && stylesNFC.androidModalOptionSelected
                                                            ]}
                                                            onPress={() => setTempMazo(String(deck.deck_id))}
                                                        >
                                                            <Text style={[
                                                                stylesNFC.androidModalOptionText,
                                                                tempMazo === String(deck.deck_id) && stylesNFC.androidModalOptionTextSelected
                                                            ]}>
                                                                {deck.deck_name}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>
                                        )}
                                        <View style={stylesNFC.modalActions}>
                                            <TouchableOpacity
                                                style={[stylesNFC.modalActionBtn, stylesNFC.modalCancelBtn]}
                                                onPress={() => setIosPickerVisible(false)}
                                            >
                                                <Text style={[stylesNFC.modalBtnText, stylesNFC.modalCancelText]}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[stylesNFC.modalActionBtn, stylesNFC.modalConfirmBtn]}
                                                onPress={() => {
                                                    setSelectedMazo(tempMazo);
                                                    setIosPickerVisible(false);
                                                }}
                                                disabled={decks.length === 0}
                                            >
                                                <Text style={[stylesNFC.modalBtnText, stylesNFC.modalConfirmText]}>Aceptar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Modal>

                        <View>
                            <Text style={stylesNFC.textsNFC}>Contenido Adicional</Text>
                            <View style={stylesNFC.containerNFCButtons}>
                                <TouchableOpacity style={stylesNFC.containerNFCButtonsContent}>
                                    <Camera />
                                    <Text style={stylesNFC.textsNFC}>Añadir Imagen</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                        <View style={stylesNFC.containerNFCButtons}>
                            <TouchableOpacity 
                                onPress={handleCreateFlashCard} 
                                style={stylesNFC.buttonSaveNFC}
                                disabled={creatingFlashcard}
                            >
                                {creatingFlashcard ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Save />
                                )}
                                <Text style={stylesNFC.textsNFC}>
                                    {creatingFlashcard ? 'Guardando...' : 'Guardar Tarjeta'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>

                {/* Modal de éxito */}
                <Modal
                    visible={successModalVisible}
                    transparent
                    animationType="fade"
                >
                    <View style={stylesNFC.successModalBackdrop}>
                        <View style={stylesNFC.successModalContent}>
                            <CheckCircle size={60} color="#4CAF50" />
                            <Text style={stylesNFC.successModalTitle}>¡Flashcard creada!</Text>
                            <Text style={stylesNFC.successModalMessage}>
                                Tu tarjeta se ha guardado exitosamente
                            </Text>
                        </View>
                    </View>
                </Modal>
            </View>

        )
    }

