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

// Modo datos planos (sin peticiones a la API)
const USE_STATIC_DATA = true;
//Datos planos de ejemplo: sólo para desarrollo/offline
const STATIC_DECKS = [
    {
        deck_id: 37,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 38,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 39,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 49,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 55,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 77,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 78,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 878,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 999,
        deck_name: 'Pedro',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 9931319,
        deck_name: 'Pedro',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
     {
        deck_id: 452,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 4545,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 754548,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 58282,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 979745,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 7872,
        deck_name: 'Animales',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 9785227,
        deck_name: 'Pedro',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    {
        deck_id: 333,
        deck_name: 'Pedro',
        flashcards: [
            {
                deck_flashcards_id: 15,
                deck_id: 37,
                user_flashcard_id: 23,
                word_id: 29,
                word: 'dog',
                translation: 'Perro',
                image_url: null,
                created_at: '2025-10-07T04:13:37.137515',
                updated_at: '2025-10-07T04:13:37.137515'
            }
        ]
    },
    // puedes añadir más mazos planos aquí si lo necesitas
];

// Normalizador de decks a metadata mínima
const normalizeDecks = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((d) => {
        const cardCount = Array.isArray(d.flashcards)
            ? d.flashcards.length
            : d.card_count ?? d.count ?? 0;
        return {
            deck_id: d.deck_id ?? d.id,
            deck_name: d.deck_name ?? d.name ?? 'Sin nombre',
            cardCount,
        };
    });
};


async function getToken() {
    const storedToken = await SecureStore.getItemAsync('token');
    const userInfo = await SecureStore.getItemAsync('userInfo');

    if (!storedToken) {
        alert('No token found');
    } else {
        return { token: storedToken, user: JSON.parse(userInfo) };
    }
}

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

    const updateSearch = (searchText) => {
        setSearch(searchText);
    };

    // esto solo para entonro de desarrollo (params se leen directo de route?.params)

    // Cargar token/usuario al enfocar la pantalla (al entrar y al volver)
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const prime = async () => {
                // Si estamos en modo datos planos, cargar metadata desde STATIC_DECKS y salir
                if (USE_STATIC_DATA && isActive) {
                    const normalized = normalizeDecks(STATIC_DECKS);
                    setDecks(normalized);
                    setIsOffline(true);
                    setLoading(false);
                    return;
                }

                try {
                    // Preferir params si existen
                    const rUser = route?.params?.user;
                    const rToken = route?.params?.token;

                    if (rUser && rToken) {
                        if (isActive) {
                            setUserData(rUser);
                        }
                        // Persistir por si aún no está guardado
                        try {
                            await SecureStore.setItemAsync('token', rToken);
                            await SecureStore.setItemAsync('userInfo', JSON.stringify(rUser));
                        } catch { }
                        // Cargar decks con axios
                        const uid = rUser?.id ?? rUser?.user_id;
                        if (uid && isActive) await fetchDecksAxios(uid, rToken);
                        return;
                    }

                    // Fallback a SecureStore
                    const stored = await getToken();
                    if (stored && isActive) {
                        setUserData(stored.user);
                        const uid = stored.user?.id ?? stored.user?.user_id;
                        if (uid) await fetchDecksAxios(uid, stored.token);
                    }
                } catch (e) {
                    // log opcional
                }
            };

            prime();

            return () => { isActive = false; };
        }, [route?.params])
    );


    // Helper para cargar decks con axios
    const fetchDecksAxios = async (uid, token) => {
        setLoading(true);
        setError(null);
        setIsOffline(false);
        // En modo datos planos, no hacer peticiones
        if (USE_STATIC_DATA) {
            const normalized = normalizeDecks(STATIC_DECKS);
            setDecks(normalized);
            setIsOffline(true);
            setLoading(false);
            return;
        }
        try {
            const url = `${config.BASE_URL}/decks/${uid}`;
            const res = await axios.get(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const data = res.data;
            const normalized = normalizeDecks(data);
            setDecks(normalized);
        } catch (err) {
            // Si ocurre un error, comprobar si es por falta de conexión o por respuesta del servidor
            const msg = err?.response?.data?.message || err?.message || 'Error fetching decks';
            setError(msg);
            // Si el error no tiene response (network error) usar los datos locales
            if (!err?.response) {
                const normalizedFallback = normalizeDecks(STATIC_DECKS);
                setDecks(normalizedFallback);
                setIsOffline(true);
            } else {
                // Si hay respuesta del servidor, dejar la lista vacía
                setDecks([]);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={{flex: 1, marginBottom: insets.bottom }}>
            <View style={{...stylesMS.containerMCTop, paddingTop: insets.top}}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>

                            <Text style={stylesMS.titlesMC}>Engli cards</Text>
                            <Text style={stylesMS.subtitlesMC}>¡Hola! {userData?.name} Continúa aprendiendo</Text>
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
                <TouchableOpacity onPress={() => navigation.push("MainScreen")} style={stylesMS.buttonCDeck} >
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
                        data={decks}
                        keyExtractor={(item, index) => (item.deck_id ? String(item.deck_id) : `${item.deck_name || 'deck'}-${index}`)}
                        renderItem={({ item }) => (
                            <View style={stylesMS.deckCard}>
                                <View style={stylesMS.deckCardLeft}>
                                    <Text style={stylesMS.deckTitle}>{item.deck_name}</Text>
                                    <Text style={stylesMS.deckCount}>{(item.cardCount != null ? item.cardCount : 0)} tarjetas</Text>
                                </View>
                            </View>
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
        </View>

    )
}