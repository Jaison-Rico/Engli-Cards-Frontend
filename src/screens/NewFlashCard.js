import { View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, ScrollView, Alert, Image } from "react-native";
import stylesNFC from "../styles/styleNFC";
import { Picker } from '@react-native-picker/picker'; //componente para crear listas desplegables
import { Camera, Save, ArrowLeft, ChevronDown, CheckCircle, Type, Globe, Lightbulb, Aperture, User } from 'lucide-react-native'; //import de icons
import React, { useState, useEffect } from 'react';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../config/api';
import * as ImagePicker from 'expo-image-picker';

export default function NewFlashCard() {
    const navigation = useNavigation();
    const [selectedMazo, setSelectedMazo] = useState("");
    // iOS: mostramos un Modal con el wheel y evitamos romper el layout
    const [iosPickerVisible, setIosPickerVisible] = useState(false);
    const [tempMazo, setTempMazo] = useState("");
    const [englishWord, setEnglishWord] = useState("");
    const [spanishTranslation, setSpanishTranslation] = useState("");

    // Imagen Picker
    const [image, setImage] = useState(null);
    // Abrir la galería y seleccionar una imagen (maneja permisos en Android)
    const pickImage = async () => {
        try {
            // En Android, asegúrate de tener permisos en tiempo de ejecución
            if (Platform.OS === 'android') {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) {
                    Alert.alert('Permiso requerido', 'Debes permitir el acceso a tus fotos para seleccionar una imagen.');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                // mediaTypes: ImagePicker.MediaType.Images, // SDK 54+: MediaTypeOptions está deprecado
                // Omitimos mediaTypes para usar el valor por defecto (imágenes)
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                exif: false,
            });

            console.log('ImagePicker result: - NewFlashCard.js:44', result);

            if (!result.canceled && result.assets?.length) {
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            console.log('ImagePicker error: - NewFlashCard.js:50', e);
            Alert.alert('Error', 'No pudimos abrir tu galería. Intenta nuevamente.');
        }
    };

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
            
            // Subir imagen a Cloudinary si el usuario seleccionó una
            let finalImageUrl = null;
            if (image) {
                const formData = new FormData();
                const uri = image;
                const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
                const mime = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
                const name = `flashcard.${ext}`;

                formData.append('image', { uri, name, type: mime });

                const token = await SecureStore.getItemAsync('token');
                const uploadUrl = `${config.BASE_URL}/cloudinary/upload-flashcard`;
                
                const uploadResponse = await axios.post(
                    uploadUrl,
                    formData,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            'Content-Type': 'multipart/form-data',
                        },
                        timeout: 30000,
                    }
                );
                
                finalImageUrl = uploadResponse.data.imageUrl;
            }

            const response = await axios.post(`${config.BASE_URL}/flashcards`, {
                word: englishWord,
                translation: spanishTranslation,
                image_url: finalImageUrl,
                user_id: +userId,
                deck_id: +selectedMazo
            });
            
            console.log('Flashcard created successfully: - NewFlashCard.js:152', response.data);
            
            // Mostrar modal de éxito
            setSuccessModalVisible(true);
            
            // Esperar 2 segundos y luego navegar hacia atrás
            setTimeout(() => {
                setSuccessModalVisible(false);
                navigation.goBack();
            }, 2000);
            
        } catch (error) {
            console.error('Error creating flashcard: - NewFlashCard.js:164', error);
            setError(error?.response?.data?.message || 'Error al crear la flashcard. Intenta de nuevo.');
        } finally {
            setCreatingFlashcard(false);
        }
    }


    return (
        <View style={stylesNFC.screenWrapper}>
            {/* Header */}
            <View style={stylesNFC.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={stylesNFC.headerIconBack}>
                    <ArrowLeft color="#12B5B0" size={24} />
                </TouchableOpacity>
                <Text style={stylesNFC.headerTitle}>Crear Flashcard</Text>
                <View style={stylesNFC.headerProfileCircle}>
                    <User color="#08302E" size={20} />
                </View>
            </View>

            {/* Main Content Card */}
            <View style={stylesNFC.containerCreateFC}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    {/* Palabra en Inglés */}
                    <Text style={stylesNFC.label}>
                        Palabra en Inglés <Text style={{color: '#12B5B0'}}>*</Text>
                    </Text>
                    <View style={stylesNFC.inputContainer}>
                        <TextInput
                            style={stylesNFC.inputField}
                            placeholder="ej. Apple"
                            placeholderTextColor="#A1CFC9"
                            value={englishWord}
                            onChangeText={setEnglishWord}
                        />
                        <Type color="#A1CFC9" size={20} />
                    </View>

                    {/* Traducción en Español */}
                    <Text style={stylesNFC.label}>
                        Traducción en Español <Text style={{color: '#12B5B0'}}>*</Text>
                    </Text>
                    <View style={stylesNFC.inputContainer}>
                        <TextInput
                            style={stylesNFC.inputField}
                            placeholder="ej. Manzana"
                            placeholderTextColor="#A1CFC9"
                            value={spanishTranslation}
                            onChangeText={setSpanishTranslation}
                        />
                        <Globe color="#A1CFC9" size={20} />
                    </View>

                    {/* Seleccionar Mazo */}
                    <Text style={stylesNFC.label}>
                        Seleccionar un Mazo <Text style={{color: '#12B5B0'}}>*</Text>
                    </Text>
                    {loadingDecks ? (
                        <View style={[stylesNFC.inputContainer, { justifyContent: 'center' }]}>
                            <ActivityIndicator size="small" color="#12B5B0" />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={stylesNFC.inputContainer}
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
                                        : (decks.length > 0 ? 'Elige un mazo...' : 'No hay mazos')
                                    }
                                </Text>
                            </View>
                            <View style={{flex: 1}}/>
                            <ChevronDown color="#A1CFC9" size={20} />
                        </TouchableOpacity>
                    )}
                    {error && <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{error}</Text>}

                    {/* Modal Picker */}
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

                    {/* Image Upload */}
                    <Text style={stylesNFC.label}>Añadir Imagen</Text>
                    <TouchableOpacity 
                        style={[stylesNFC.imageUploadBox, image ? { padding: 0, overflow: 'hidden', borderWidth: 0 } : {}]} 
                        onPress={pickImage}
                    >
                        {image ? (
                            <Image source={{ uri: image }} style={{ width: '100%', height: 160, resizeMode: 'cover', borderRadius: 16 }} />
                        ) : (
                            <>
                                <View style={stylesNFC.imageUploadCircle}>
                                    <Aperture color="#086B67" size={24} />
                                </View>
                                <Text style={stylesNFC.imageUploadTitle}>Subir una referencia visual</Text>
                                <Text style={stylesNFC.imageUploadSub}>JPG, PNG hasta 5MB</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Tip Block */}
                    <View style={stylesNFC.tipBlock}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Lightbulb color="#086B67" size={18} />
                            <Text style={stylesNFC.tipTitle}>Tip del Erudito</Text>
                        </View>
                        <Text style={stylesNFC.tipText}>
                            Añadir una imagen relevante ayuda a tu cerebro a crear conexiones neuronales más fuertes y memorizar hasta un 40% más rápido.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        onPress={handleCreateFlashCard} 
                        style={stylesNFC.saveButton}
                        disabled={creatingFlashcard}
                    >
                        {creatingFlashcard ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Save color="#fff" size={20} />
                        )}
                        <Text style={stylesNFC.saveButtonText}>
                            {creatingFlashcard ? 'Guardando...' : 'Guardar Tarjeta'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>

            {/* Success Modal */}
            <Modal
                visible={successModalVisible}
                transparent
                animationType="fade"
            >
                <View style={stylesNFC.successModalBackdrop}>
                    <View style={stylesNFC.successModalContent}>
                        <CheckCircle size={60} color="#12B5B0" />
                        <Text style={stylesNFC.successModalTitle}>¡Flashcard creada!</Text>
                        <Text style={stylesNFC.successModalMessage}>
                            Tu tarjeta se ha guardado exitosamente
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
    }