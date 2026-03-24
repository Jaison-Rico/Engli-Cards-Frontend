import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Alert, Image, StatusBar } from "react-native";
import stylesNFC from "../styles/styleNFC"; // Reusing styles from NewFlashCard
import { Trash2, Save, ArrowLeft, Type, Globe, Aperture, CheckCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../config/api';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdateFlashCard() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { card } = route.params;

    const [englishWord, setEnglishWord] = useState(card.word || "");
    const [spanishTranslation, setSpanishTranslation] = useState(card.translation || "");
    const [image, setImage] = useState(card.image_url || null);
    
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [error, setError] = useState(null);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets?.length) {
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('Error', 'No pudimos abrir tu galería.');
        }
    };

    const handleUpdate = async () => {
        if (!englishWord.trim() || !spanishTranslation.trim()) {
            setError('Campos obligatorios vacíos.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const storedUser = await SecureStore.getItemAsync('userInfo');
            const user = JSON.parse(storedUser);
            const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

            let finalImageUrl = image;

            // Si la imagen es una URI local (empezando con file:// o similar), subirla
            if (image && !image.startsWith('http')) {
                const formData = new FormData();
                const ext = (image.split('.').pop() || 'jpg').toLowerCase();
                const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
                
                formData.append('image', {
                    uri: image,
                    name: `flashcard.${ext}`,
                    type: mime,
                });

                const uploadUrl = `${config.BASE_URL}/cloudinary/upload-flashcard`;
                const uploadResp = await axios.post(uploadUrl, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadResp.data.imageUrl;
            }

            await axios.patch(`${config.BASE_URL}/flashcards/${card.id}`, {
                word: englishWord,
                translation: spanishTranslation,
                image_url: finalImageUrl,
                user_id: +userId
            });

            setSuccessModalVisible(true);
            setTimeout(() => {
                setSuccessModalVisible(false);
                navigation.goBack();
            }, 1500);

        } catch (err) {
            setError(err?.response?.data?.message || 'Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Tarjeta",
            "¿Estás seguro de que quieres borrar esta flashcard?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const storedUser = await SecureStore.getItemAsync('userInfo');
                            const user = JSON.parse(storedUser);
                            const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

                            await axios.delete(`${config.BASE_URL}/flashcards/${card.id}`, {
                                data: { userId: +userId }
                            });
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert("Error", "No se pudo eliminar.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[stylesNFC.screenWrapper, { backgroundColor: '#E6F9F9' }]}>
            <StatusBar barStyle="dark-content" />
            <View style={[stylesNFC.headerContainer, { paddingTop: insets.top + 10, backgroundColor: 'transparent' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={stylesNFC.headerIconBack}>
                    <ArrowLeft color="#08302E" size={24} />
                </TouchableOpacity>
                <Text style={[stylesNFC.headerTitle, { color: '#08302E' }]}>Editar Flashcard</Text>
                <TouchableOpacity onPress={handleDelete} style={{ marginRight: 10 }}>
                    <Trash2 color="#08302E" size={24} />
                </TouchableOpacity>
            </View>

            <View style={[stylesNFC.containerCreateFC, { borderTopLeftRadius: 30, borderTopRightRadius: 30, flex: 1 }]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    
                    {/* Image Preview / Upload Box */}
                    <TouchableOpacity 
                        style={[stylesNFC.imageUploadBox, { height: 180, marginTop: 10, borderRadius: 30, overflow: 'hidden', borderWidth: 0 }]} 
                        onPress={pickImage}
                    >
                        {image ? (
                            <View style={{ width: '100%', height: '100%' }}>
                                <Image source={{ uri: image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                <View style={{ position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                                    <Aperture size={14} color="#086B67" style={{ marginRight: 5 }} />
                                    <Text style={{ fontSize: 12, color: '#086B67', fontWeight: '600' }}>Cambiar Imagen</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <Aperture color="#086B67" size={32} />
                                <Text style={stylesNFC.imageUploadTitle}>Añadir Imagen</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Inputs */}
                    <Text style={[stylesNFC.label, { marginTop: 25 }]}>Palabra en Inglés</Text>
                    <View style={stylesNFC.inputContainer}>
                        <TextInput
                            style={stylesNFC.inputField}
                            value={englishWord}
                            onChangeText={setEnglishWord}
                        />
                        <Type color="#A1CFC9" size={20} />
                    </View>

                    <Text style={stylesNFC.label}>Traducción en Español</Text>
                    <View style={stylesNFC.inputContainer}>
                        <TextInput
                            style={stylesNFC.inputField}
                            value={spanishTranslation}
                            onChangeText={setSpanishTranslation}
                        />
                        <Globe color="#A1CFC9" size={20} />
                    </View>

                    {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}

                    <TouchableOpacity 
                        onPress={handleUpdate} 
                        style={[stylesNFC.saveButton, { marginTop: 30, backgroundColor: '#12B5B0' }]}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <CheckCircle color="#fff" size={20} style={{ marginRight: 10 }} />
                                <Text style={stylesNFC.saveButtonText}>Actualizar Tarjeta</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>

            {/* Success Modal */}
            <Modal visible={successModalVisible} transparent animationType="fade">
                <View style={stylesNFC.successModalBackdrop}>
                    <View style={stylesNFC.successModalContent}>
                        <CheckCircle size={60} color="#12B5B0" />
                        <Text style={stylesNFC.successModalTitle}>¡Actualizada!</Text>
                        <Text style={stylesNFC.successModalMessage}>La tarjeta se guardó con éxito</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
