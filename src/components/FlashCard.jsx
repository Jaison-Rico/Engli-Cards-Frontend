import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

// Componente genérico de FlashCard con animación de giro y botón de voz.
// - Recibe estilos externos para evitar duplicación y permitir personalización por pantalla.
// - Por defecto asume keys "english" y "spanish" en el objeto item, e "image" para la imagen.
// - Permite configurar etiquetas, idiomas de TTS y keys si la data usa otros nombres.
export default function FlashCard({
	item,
	styles,
	containerStyle,
	frontKey = 'english',
	backKey = 'spanish',
	imageKey = 'image',
	frontLabel = 'English',
	backLabel = 'Español',
	speakEnabled = true,
	langFront = 'en-US',
	langBack = 'es-ES',
}) {
	if (!item) return null;

	// Estado/animación de giro
	const flip = useSharedValue(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const frontAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
		return { transform: [{ rotateY: `${rotateY}deg` }] };
	});

	const backAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
		return { transform: [{ rotateY: `${rotateY}deg` }] };
	});

	const handleFlip = () => {
		flip.value = withSpring(isFlipped ? 0 : 1, { damping: 10, stiffness: 100 });
		setIsFlipped(!isFlipped);
	};

	const handleSpeak = () => {
		if (!speakEnabled) return;
		const text = isFlipped ? item?.[backKey] : item?.[frontKey];
		const language = isFlipped ? langBack : langFront;
		if (!text) return;
		try {
			Speech.stop();
			Speech.speak(text, { language, pitch: 1.0, rate: 1.0 });
		} catch (e) {
			// Evita romper UI si TTS falla o no está disponible
		}
	};

	// Fallback mínimo si no pasan estilos (mantener robustez)
	const base = styles ?? defaultStyles;
	const imgUri = item?.[imageKey];

	return (
		<View style={base.centerAligned}>
			<TouchableOpacity onPress={handleFlip} style={[base.cardContainer, containerStyle]}>
				<Animated.View style={[base.card, base.cardFront, frontAnimatedStyle]}>
					<Text style={base.cardSubtitle}>{frontLabel}</Text>
					<Text style={base.cardText}>{item?.[frontKey]}</Text>
					{imgUri ? (
						<Image source={{ uri: imgUri }} style={base.cardImage} />
					) : null}
					<Text style={base.cardHint}>Toca para ver traducción</Text>
				</Animated.View>
				<Animated.View style={[base.card, base.cardBack, backAnimatedStyle]}>
					<Text style={base.cardSubtitle}>{backLabel}</Text>
					<Text style={base.cardText}>{item?.[backKey]}</Text>
					{imgUri ? (
						<Image source={{ uri: imgUri }} style={base.cardImage} />
					) : null}
					<Text style={base.cardHint}>Toca para volver</Text>
				</Animated.View>
			</TouchableOpacity>

			{speakEnabled ? (
				<TouchableOpacity onPress={handleSpeak} style={base.audioBtn}>
					<Ionicons name="volume-high" size={20} color="#fff" />
					<Text style={base.audioText}>Escuchar</Text>
				</TouchableOpacity>
			) : null}
		</View>
	);
}

// Estilos de respaldo por si no se inyectan estilos desde la pantalla
const defaultStyles = {
	centerAligned: { alignItems: 'center' },
	cardContainer: { width: 300, height: 200, marginVertical: 12 },
	card: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		backfaceVisibility: 'hidden',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	cardFront: { backgroundColor: '#3b82f6' },
	cardBack: { backgroundColor: '#3b82f6' },
	cardSubtitle: { position: 'absolute', top: 12, left: 12, color: 'rgba(255,255,255,0.9)', zIndex: 2 },
	cardText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
	cardHint: { color: 'rgba(255,255,255,0.7)', marginTop: 10 },
	audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginTop: 12 },
	audioText: { color: '#fff', fontWeight: '600' },
	cardImage: { width: 200, height: 150, resizeMode: 'contain' },
};
