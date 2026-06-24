import { useAppTheme } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Animated, Platform } from 'react-native';
import { CheckCircle, AlertCircle, Layers } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuth, getUserId } from '../context/AuthContext';
import { createDeck } from '../services/decks.service';
import get_stylesMS from '../styles/mainScreen.styles';

export default function CreateDeck({ visible, onClose, onCreateDeck }) {
  const { theme } = useAppTheme();
  const stylesMS = get_stylesMS(theme);
  const { user } = useAuth();
  const userId = getUserId(user);

	const [deckName, setDeckName] = useState("");
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState({ visible: false, message: '', type: '' });
	const [toastAnim] = useState(new Animated.Value(0));

	useEffect(() => {
		if (toast.visible) {
			Animated.sequence([
				Animated.spring(toastAnim, {
					toValue: 1,
					useNativeDriver: true,
					tension: 50,
					friction: 7
				}),
				Animated.delay(2500),
				Animated.timing(toastAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				})
			]).start(() => {
				setToast({ visible: false, message: '', type: '' });
			});
		}
	}, [toast.visible]);

	const showToast = (message, type) => {
		setToast({ visible: true, message, type });
	};

	const handleCreate = async () => {
		if (!deckName.trim()) {
			showToast('Por favor ingresa un nombre para el mazo', 'error');
			return;
		}

		if (!userId) {
			showToast('No se encontró el ID de usuario', 'error');
			return;
		}
		setLoading(true);
		try {
			const response = await createDeck(deckName.trim(), userId);
			showToast(`¡Mazo "${deckName}" creado exitosamente!`, 'success');
			setTimeout(() => {
				if (onCreateDeck) onCreateDeck(response);
				setDeckName('');
				onClose();
			}, 1500);
		} catch (err) {
			showToast(err?.response?.data?.message || err?.message || 'Error al crear el mazo', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setDeckName("");
		onClose();
	};

	const OverlayComponent = Platform.OS === 'web' ? View : BlurView;

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={handleClose}
		>
			<OverlayComponent
				intensity={20}
				tint="dark"
				style={stylesMS.modalOverlay}
			>
				<View style={stylesMS.modalContainer}>
					
					{/* Modal Header Icon */}
					<View style={stylesMS.modalHeaderIcon}>
						<Layers color="#084E4D" size={28} strokeWidth={2.5} />
					</View>

					{/* Modal Title and Subtitle */}
					<Text style={stylesMS.modalTitleCenter}>Crear Nuevo Mazo</Text>
					<Text style={stylesMS.modalSubtitle}>
						Organiza tus tarjetas de aprendizaje en un mazo personalizado para mejorar tu retención.
					</Text>

					{/* Input section */}
					<Text style={stylesMS.modalLabel}>Nombre del Mazo</Text>
					<TextInput
						style={stylesMS.modalInput}
						placeholder="Ej: Negocios Avanzado"
						value={deckName}
						onChangeText={setDeckName}
						placeholderTextColor="#A1CFC9"
						editable={!loading}
						autoCapitalize="sentences"
					/>

					{/* Action Buttons */}
					<TouchableOpacity 
						style={[
							stylesMS.modalButtonCreate,
							loading && { opacity: 0.7 }
						]}
						onPress={handleCreate}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color="#ffffff" />
						) : (
							<Text style={stylesMS.modalButtonTextCreate}>Crear Mazo</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity 
						style={stylesMS.modalButtonCancel}
						onPress={handleClose}
						disabled={loading}
					>
						<Text style={stylesMS.modalButtonTextCancel}>Cancelar</Text>
					</TouchableOpacity>

				</View>

				{/* Toast Notification */}
				{toast.visible && (
					<Animated.View
						style={[
							stylesMS.toastContainer,
							{
								backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
								transform: [
									{
										translateY: toastAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [-100, 50]
										})
									},
									{
										scale: toastAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [0.8, 1]
										})
									}
								],
								opacity: toastAnim
							}
						]}
					>
						<View style={stylesMS.toastContent}>
							{toast.type === 'success' ? (
								<CheckCircle size={24} color="white" />
							) : (
								<AlertCircle size={24} color="white" />
							)}
							<Text style={stylesMS.toastText}>{toast.message}</Text>
						</View>
					</Animated.View>
				)}
			</OverlayComponent>
		</Modal>
	);
}
