import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
// Pantalla principal básica con solo texto
const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenido a EngliCards</Text>
      <Text>Esta es la pantalla principal de la aplicación.</Text>
    </View>
  );
};

export default HomeScreen;