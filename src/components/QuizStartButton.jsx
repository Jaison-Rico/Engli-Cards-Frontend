import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Botón reutilizable para iniciar una "Prueba/Quiz".
// Props:
// - onPress: función a ejecutar al presionar.
// - label: texto del botón (por defecto "Comenzar Prueba").
// - iconName: nombre del ícono Ionicons (por defecto "play-outline").
// - iconSize, iconColor: tamaño y color del ícono.
// - buttonStyle, textStyle: estilos provenientes de cada hoja de estilos de pantalla.
export default function QuizStartButton({
	onPress = () => {},
	label = 'Comenzar Prueba',
	iconName = 'play-outline',
	iconSize = 20,
	iconColor = '#fff',
	buttonStyle,
	textStyle,
}) {
	return (
		<TouchableOpacity onPress={onPress} style={buttonStyle}>
			<Ionicons name={iconName} size={iconSize} color={iconColor} />
			<Text style={textStyle}>{label}</Text>
		</TouchableOpacity>
	);
}
