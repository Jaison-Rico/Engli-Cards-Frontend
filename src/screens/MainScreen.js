import stylesMS from '../styles/stylesMS';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { BookOpen, ChartLine, Plus } from 'lucide-react-native';
import { SearchBar } from '@rneui/themed';
import * as Device from 'expo-device';
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
            cardCount: d.cardCount ?? d.cardsCount ?? (Array.isArray(d.flashcards) ? d.flashcards.length : (Array.isArray(d.cards) ? d.cards.length : 0))
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
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
            <View style={{ ...stylesMS.containerMCTop, paddingTop: insets.top }}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>

                            <Text style={stylesMS.titlesMC}>Engli cards</Text>
                            <Text style={stylesMS.subtitlesMC}>¡Hola! {userData?.name.split(' ')[0] || 'Usuario'} Continúa aprendiendo</Text>
                        </View>

                        <TouchableOpacity onPress={() => navigation.push("StatsScreen")} style={stylesMS.buttonStats}>
                            <ChartLine />
                            <Text style={stylesMS.textButtonMCStats}>
                                Stats
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <SearchBar
                        placeholder="Nombre del deck"
                        onChangeText={updateSearch}
                        value={search}
                        platform={Device.osName === 'Android' ? 'android' : 'ios'}
                        searchIcon={null}
                        clearIcon={null}
                        cancelIcon={null}
                        containerStyle={stylesMS.searchContainer}
                        inputContainerStyle={stylesMS.searchInputContainer}
                    />
                </View>
            </View>
            <View style={stylesMS.containerMCBottonsMain}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={stylesMS.buttonCDeck} >
                    <Plus />
                    <Text>Crear Deck</Text>
                </TouchableOpacity>
                <TouchableOpacity style={stylesMS.buttonCFlashcard} onPress={() => navigation.push("NewFlashCard")}>
                    <BookOpen />
                    <Text>Crear Flashcard</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 30, marginLeft: 20 }}>
                Mis Mazos
            </Text>
            <View style={stylesMS.deckListContainer}>
                {isOffline && (
                    <Text style={{ margin: 10, textAlign: 'center', color: 'orange' }}>
                        Estás en modo offline — mostrando mazos locales
                    </Text>
                )}
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={decks.filter((d) => d.deck_name?.toLowerCase().includes(search.toLowerCase()))}
                        keyExtractor={(item, index) => (item.deck_id ? String(item.deck_id) : `${item.deck_name || 'deck'}-${index}`)}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={stylesMS.deckCard}
                                activeOpacity={0.7}
                                onPress={() => {
                                    // Aquí puedes navegar a la vista de detalle del deck
                                    // navigation.navigate('DeckDetail', { deckId: item.deck_id });
                                }}
                            >
                                <View style={stylesMS.deckCardLeft}>
                                    <Text style={stylesMS.deckTitle}>{item.deck_name}</Text>
                                    <Text style={stylesMS.deckCount}>{(item.cardCount != null ? item.cardCount : 0)} tarjetas</Text>
                                </View>
                                <View style={stylesMS.deckCardRight}>
                                    <BookOpen size={24} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={{ margin: 20, textAlign: 'center' }}>
                                {error ? `Error: ${error}` : 'No hay mazos para mostrar'}
                            </Text>
                        )}
                        contentContainerStyle={decks.length === 0 ? { flexGrow: 1 } : { paddingBottom: 8 }}
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

    )
}