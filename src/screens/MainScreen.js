import stylesMS from '../styles/stylesMS';
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'; 
import { SearchBar } from '@rneui/themed';

export default function MainScreen() {
    const navigation = useNavigation(); //obtiene la función de navegación
    const [search, setSearch] = useState("");

    const updateSearch = (searchText) => {
    setSearch(searchText);
    };

    
    return(
        <View style={stylesMS.containerMCTop}>
            <Text style={stylesMS.titlesMC}>Engli cards</Text>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, marginTop:10}}>
                <Text style={stylesMS.subtitlesMC}>¡Hola! Continúa aprendiendo</Text>
                <TouchableOpacity>
                    <Text style={stylesMS.textButtonMCStats}>Stats</Text>
                </TouchableOpacity>
            </View>

            <SearchBar
                placeholder="Type Here..."
                onChangeText={updateSearch}
                value={search}
                platform="android"
                containerStyle={stylesMS.searchContainer}
                inputContainerStyle={stylesMS.searchInputContainer}
            />
        </View>
    )
}