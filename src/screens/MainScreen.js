import stylesMS from '../styles/stylesMS';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { BookOpen, ChartLine, Plus } from 'lucide-react-native';
import { SearchBar } from '@rneui/themed';
import * as Device from 'expo-device';

export default function MainScreen() {
    const navigation = useNavigation(); //obtiene la función de navegación
    const [search, setSearch] = useState("");
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateSearch = (searchText) => {
        setSearch(searchText);
    };

    useEffect(() => {
        // TODO: replace hardcoded userId with value from login/session
        const userId = 1;
        const url = `https://d6e15d595af7.ngrok-free.app/decks/${userId}`;

        let cancelled = false;
        const fetchDecks = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) setDecks(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Error fetching decks');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDecks();
        return () => { cancelled = true; };
    }, []);


    return (
        <View class="princial-screen">
            <View style={stylesMS.containerMCTop}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>

                            <Text style={stylesMS.titlesMC}>Engli cards</Text>
                            <Text style={stylesMS.subtitlesMC}>¡Hola! Continúa aprendiendo</Text>
                        </View>

                        <TouchableOpacity style={stylesMS.buttonStats}>
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
            <View class="buttons-create-deck-and-flashcard" style={stylesMS.containerMCBottonsMain}>
                <TouchableOpacity style={stylesMS.buttonCDeck} >
                    <Plus />
                    <Text>Crear Deck</Text>
                </TouchableOpacity>
                <TouchableOpacity style={stylesMS.buttonCFlashcard}>
                    <BookOpen />
                    <Text>Crear Flashcard</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 30, marginLeft: 20 }}>
                Mis Mazos
            </Text>
            <View style={stylesMS.deckListContainer}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <FlatList
                        data={decks}
                        keyExtractor={(item) => (item.deck_id ? item.deck_id.toString() : Math.random().toString())}
                        renderItem={({ item }) => (
                            <View style={stylesMS.deckCard}>
                                <View style={stylesMS.deckCardLeft}>
                                    <Text style={stylesMS.deckTitle}>{item.deck_name}</Text>
                                    <Text style={stylesMS.deckCount}>{(item.flashcards && item.flashcards.length) || 0} tarjetas</Text>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={{ margin: 20, textAlign: 'center' }}>
                                {error ? `Error: ${error}` : 'No hay mazos para mostrar'}
                            </Text>
                        )}
                        contentContainerStyle={decks.length === 0 ? { flex: 1 } : {}}
                    />
                )}
            </View>
        </View>

    )
}