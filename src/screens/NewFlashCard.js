import { useAppTheme } from '../context/ThemeContext';
import { View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, ScrollView, Alert, Image } from "react-native";
import get_stylesNFC from '../styles/styleNFC';
import { Picker } from '@react-native-picker/picker'; //componente para crear listas desplegables
import { Camera, Save, ArrowLeft, ChevronDown, CheckCircle, Type, Globe, Lightbulb, Aperture, User } from 'lucide-react-native'; //import de icons
import React, { useState, useEffect } from 'react';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, getUserId } from '../context/AuthContext';
import client from '../services/client';
import * as ImagePicker from 'expo-image-picker';

export default function NewFlashCard() {
  const { theme } = useAppTheme();
  const stylesNFC = get_stylesNFC(theme);
  const { user } = useAuth();
  const userId = getUserId(user);

    const navigation = useNavigation();
    const [selectedMazo, setSelectedMazo] = useState("");
    // iOS: mostramos un Modal con el wheel y evitamos romper el layout
    const [iosPickerVisible, setIosPickerVisible] = useState(false);
    const [tempMazo, setTempMazo] = useState("");
    const [englishWord, setEnglishWord] = useState("");
    const [spanishTranslation, setSpanishTranslation] = useState("");

    // Imagen Picker
    const [image, setImage] = useState(null);
    const [mediaType, setMediaType] = useState('image'); // 'image' o 'gif'
    const [gifUrl, setGifUrl] = useState('');
    
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
                if (!userId) { setError('No se encontró el ID de usuario.'); return; }
                setLoadingDecks(true);
                setError(null);
                try {
                    const { getDecks } = await import('../services/decks.service');
                    const data = await getDecks(userId, false);
                    if (isActive) setDecks(data.filter((d) => !d.is_system));
                } catch (err) {
                    if (isActive) {
                        setError(err?.response?.data?.message || err?.message || 'Error al cargar mazos');
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
            // Determinar URL final: GIF directo o imagen subida a Cloudinary
            let finalImageUrl = null;
            if (mediaType === 'gif' && gifUrl.trim()) {
                finalImageUrl = gifUrl.trim();
            } else if (mediaType === 'image' && image) {
                const formData = new FormData();
                const uri = image;
                const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
                const mime = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
                formData.append('image', { uri, name: `flashcard.${ext}`, type: mime });
                const uploadResponse = await client.post('/cloudinary/upload-flashcard', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000,
                });
                finalImageUrl = uploadResponse.data.imageUrl;
            }

            const response = await client.post('/flashcards', {
                word: englishWord,
                translation: spanishTranslation,
                image_url: finalImageUrl,
                user_id: +userId,
                deck_id: +selectedMazo,
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

                    {/* Media Upload - Image or GIF */}
                    <Text style={stylesNFC.label}>Añadir Media</Text>
                    
                    {/* Toggle Buttons */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        <TouchableOpacity
                            style={[
                                { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
                                mediaType === 'image'
                                    ? { borderColor: '#12B5B0', backgroundColor: '#E0F7F6' }
                                    : { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' }
                            ]}
                            onPress={() => {
                                setMediaType('image');
                                setGifUrl('');
                            }}
                        >
                            <Text style={[
                                { fontWeight: '600', fontSize: 14 },
                                mediaType === 'image' ? { color: '#12B5B0' } : { color: '#6B7280' }
                            ]}>
                                Imagen
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
                                mediaType === 'gif'
                                    ? { borderColor: '#12B5B0', backgroundColor: '#E0F7F6' }
                                    : { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' }
                            ]}
                            onPress={() => {
                                setMediaType('gif');
                                setImage(null);
                            }}
                        >
                            <Text style={[
                                { fontWeight: '600', fontSize: 14 },
                                mediaType === 'gif' ? { color: '#12B5B0' } : { color: '#6B7280' }
                            ]}>
                                GIF
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Image Section */}
                    {mediaType === 'image' && (
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
                    )}
                    
                    {/* GIF Section */}
                    {mediaType === 'gif' && (
                        <View>
                            <Text style={[stylesNFC.label, { marginTop: 8, marginBottom: 8 }]}>URL del GIF</Text>
                            <View style={stylesNFC.inputContainer}>
                                <TextInput
                                    style={stylesNFC.inputField}
                                    placeholder="https://ejemplo.com/animation.gif"
                                    placeholderTextColor="#A1CFC9"
                                    value={gifUrl}
                                    onChangeText={setGifUrl}
                                />
                            </View>
                            {gifUrl && (
                                <View style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F0F9F8', padding: 8 }}>
                                    <Image 
                                        source={{ uri: gifUrl }} 
                                        style={{ width: '100%', height: 160, resizeMode: 'cover', borderRadius: 8 }}
                                        onError={() => Alert.alert('Error', 'No se pudo cargar el GIF. Verifica la URL.')}
                                    />
                                </View>
                            )}
                        </View>
                    )}

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