import stylesMS from '../styles/stylesMS';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, StatusBar, Alert } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { BookOpen, Activity, Plus } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../config/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreateDeck from './CreateDeck';


export default function MainScreen({ route }) {
    const navigation = useNavigation(); //obtiene la función de navegación
    const [search, setSearch] = useState("");
    const [decks, setDecks] = useState([]);
    const insets = useSafeAreaInsets();
    // bandera para indicar que estamos usando datos locales por falta de conexión
    const [isOffline, setIsOffline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    // eliminado tokenData: no se usa en la UI ni en lógica

    // Estado para el modal de crear deck
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const updateSearch = (searchText) => {
        setSearch(searchText);
    };

    // Función para recargar los decks
    const handleDeckCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Normaliza posibles respuestas del backend a un modelo consistente para la UI
    const normalizeDecks = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((d) => ({
            // el backend actual usa deck_id y deck_name; cubrimos alias por si cambian
            deck_id: d.deck_id ?? d.id ?? d._id ?? d.deckId ?? String(Math.random()),
            deck_name: d.deck_name ?? d.name ?? d.title ?? 'Deck',
            // contar flashcards si vienen, o cards/cardsCount
            cardCount: d.cardCount ?? d.cardsCount ?? (Array.isArray(d.flashcards) ? d.flashcards.length : (Array.isArray(d.cards) ? d.cards.length : 0)),
            flashcards: d.flashcards
        }));
    };

    // Carga el usuario desde params o SecureStore y obtiene sus mazos
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const fetchDecks = async () => {
                setLoading(true);
                setError(null);
                try {
                    // 1) Obtener usuario
                    let user = route?.params?.user || null;
                    if (!user) {
                        const storedUser = await SecureStore.getItemAsync('userInfo');
                        if (storedUser) user = JSON.parse(storedUser);
                    }
                    if (isActive) setUserData(user || null);

                    // 2) Resolver userId (cubrimos posibles nombres de campo)
                    const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;
                    if (!userId) {
                        if (isActive) {
                            setDecks([]);
                            setError('No se encontró el ID de usuario. Inicia sesión nuevamente.');
                        }
                        return;
                    }

                    // 3) Token (si existe)
                    const token = (await SecureStore.getItemAsync('token')) || route?.params?.token || null;
                    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

                    // 4) Llamada al backend
                    const url = `${config.BASE_URL}/decks/${userId}`;
                    const resp = await axios.get(url, { headers });
                    const data = Array.isArray(resp.data) ? resp.data : (resp.data?.decks ?? []);

                    if (isActive) {
                        setDecks(normalizeDecks(data));
                        setIsOffline(false);
                    }
                } catch (err) {
                    const serverMessage = err?.response?.data?.message || err?.message || 'Error inesperado';
                    if (isActive) {
                        setError(serverMessage);
                        setIsOffline(true);
                        setDecks([]);
                    }
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchDecks();

            return () => {
                isActive = false;
            };
        }, [route, refreshKey])
    );



    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={{ ...stylesMS.containerMCTop, paddingTop: insets.top + 10 }}>
                {/* Header Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={stylesMS.titlesMC}>Engli cards</Text>
                        <Text style={stylesMS.subtitlesMC}>¡Hola! {userData?.name?.split(' ')[0] || 'jaison'} Continúa aprendiendo</Text>
                    </View>

                    <TouchableOpacity onPress={() => navigation.push("StatsScreen")} style={stylesMS.buttonStats}>
                        <Activity color="#08302E" size={18} strokeWidth={2.5} />
                        <Text style={stylesMS.textButtonMCStats}>Stats</Text>
                    </TouchableOpacity>
                </View>

                {/* Flat Search Input */}
                <View style={stylesMS.searchContainerTop}>
                    <TextInput
                        style={stylesMS.searchInputTop}
                        placeholder="Nombre del deck"
                        placeholderTextColor="#A1CFC9"
                        value={search}
                        onChangeText={updateSearch}
                    />
                </View>
            </View>

            {/* Main Action Buttons */}
            <View style={stylesMS.containerMCBottonsMain}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={stylesMS.buttonCDeck} activeOpacity={0.8}>
                    <Plus color="#08302E" size={32} strokeWidth={2} />
                    <Text style={stylesMS.buttonCardText}>Crear Deck</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.push("NewFlashCard")} style={stylesMS.buttonCFlashcard} activeOpacity={0.8}>
                    <BookOpen color="#08302E" size={30} strokeWidth={2} />
                    <Text style={stylesMS.buttonCardText}>Crear Flashcard</Text>
                </TouchableOpacity>
            </View>

            {/* Section Title */}
            <Text style={stylesMS.misMazosTitle}>Mis Mazos</Text>

            {/* Deck List */}
            <View style={stylesMS.deckListContainer}>
                {isOffline && (
                    <Text style={{ margin: 10, textAlign: 'center', color: 'orange' }}>
                        Estás en modo offline — mostrando mazos locales
                    </Text>
                )}
                {loading ? (
                    <ActivityIndicator size="large" color="#12B5B0" />
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={decks.filter((d) => d.deck_name?.toLowerCase().includes(search.toLowerCase()))}
                        keyExtractor={(item, index) => (item.deck_id ? String(item.deck_id) : `${item.deck_name || 'deck'}-${index}`)}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={stylesMS.deckCard}
                                activeOpacity={0.7}
                                onPress={() => {
                                    navigation.navigate('DeckDetails', { deck: item });
                                }}
                            >
                                <View style={stylesMS.deckCardLeft}>
                                    <Text style={stylesMS.deckTitle}>{item.deck_name}</Text>
                                    <Text style={stylesMS.deckCount}>{(item.cardCount != null ? item.cardCount : 0)} tarjetas</Text>
                                </View>
                                <TouchableOpacity 
                                    style={stylesMS.deckCardRight}
                                    onPress={(e) => {
                                        // Evitar que el clic en el botón active el clic en la tarjeta (DeckDetails)
                                        e.stopPropagation();
                                        if (item.flashcards && item.flashcards.length > 0) {
                                            navigation.navigate('GameFlashCard', { sampleCards: item.flashcards });
                                        } else {
                                            Alert.alert("Mazo vacío", "Agrega algunas flashcards antes de estudiar.");
                                        }
                                    }}
                                >
                                    <BookOpen size={20} color="#ffffff" strokeWidth={2.5} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={{ margin: 20, textAlign: 'center', color: '#527F7C' }}>
                                {error ? `Error: ${error}` : 'No hay mazos para mostrar'}
                            </Text>
                        )}
                        contentContainerStyle={decks.length === 0 ? { flexGrow: 1 } : { paddingBottom: 20 }}
                    />
                )}
            </View>

            {/* Modal para crear deck */}
            <CreateDeck
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreateDeck={handleDeckCreated}
            />
        </View>
    );
}