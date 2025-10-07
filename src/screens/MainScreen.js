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


async function getToken() {
    const storedToken = await SecureStore.getItemAsync('token');
    const userInfo = await SecureStore.getItemAsync('userInfo');
    
    if (!storedToken) {
        alert('No token found');
    }else{
        return { token: storedToken, user: JSON.parse(userInfo)  };
    }
}

export default function MainScreen({route}) {
    const navigation = useNavigation(); //obtiene la función de navegación
    const [search, setSearch] = useState("");
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [tokenData, setTokenData] = useState("");

    const updateSearch = (searchText) => {
        setSearch(searchText);
    };

    // esto solo para entonro de desarrollo
    const { user, token } = route?.params || {};

    // Cargar token/usuario al enfocar la pantalla (al entrar y al volver)
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const prime = async () => {
                try {
                    // Preferir params si existen
                    const rUser = route?.params?.user;
                    const rToken = route?.params?.token;

                    if (rUser && rToken) {
                        if (isActive) {
                            setUserData(rUser);
                            setTokenData(rToken);
                        }
                        // Persistir por si aún no está guardado
                        try {
                            await SecureStore.setItemAsync('token', rToken);
                            await SecureStore.setItemAsync('userInfo', JSON.stringify(rUser));
                        } catch {}
                        // Cargar decks con axios
                        const uid = rUser?.id ?? rUser?.user_id;
                        if (uid && isActive) await fetchDecksAxios(uid, rToken);
                        return;
                    }

                    // Fallback a SecureStore
                    const stored = await getToken();
                    if (stored && isActive) {
                        setUserData(stored.user);
                        setTokenData(stored.token);
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
    	try {
    		const url = `${config.BASE_URL}/decks/${uid}`;
    		const res = await axios.get(url, {
    			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    		});
    		const data = res.data;
    		setDecks(Array.isArray(data) ? data : []);
    	} catch (err) {
    		const msg = err?.response?.data?.message || err?.message || 'Error fetching decks';
    		setError(msg);
    		setDecks([]);
    	} finally {
    		setLoading(false);
    	}
    };

    
    return (
        <View class="princial-screen">
            <View style={stylesMS.containerMCTop}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>

                            <Text style={stylesMS.titlesMC}>Engli cards</Text>
                            <Text style={stylesMS.subtitlesMC}>¡Hola! {userData?.name} Continúa aprendiendo</Text>
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
            <View style={stylesMS.containerMCBottonsMain}>
                <TouchableOpacity onPress={()=> navigation.push("MainScreen")}  style={stylesMS.buttonCDeck} >
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