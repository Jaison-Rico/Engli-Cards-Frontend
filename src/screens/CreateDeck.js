import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { X, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { config } from '../config/api';
import stylesMS from '../styles/stylesMS';

export default function CreateDeck({ visible, onClose, onCreateDeck }) {
	const [deckName, setDeckName] = useState("");
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState({ visible: false, message: '', type: '' });
	const [toastAnim] = useState(new Animated.Value(0));

	// Animación del toast
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

		setLoading(true);

		try {
			// Obtener el usuario del storage
			const storedUser = await SecureStore.getItemAsync('userInfo');
			if (!storedUser) {
				showToast('No se encontró información del usuario', 'error');
				setLoading(false);
				return;
			}

			const user = JSON.parse(storedUser);
			const userId = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

			if (!userId) {
				showToast('No se encontró el ID de usuario', 'error');
				setLoading(false);
				return;
			}

			// Obtener el token si existe
			const token = await SecureStore.getItemAsync('token');
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			// Crear el deck
			const response = await axios.post(
				`${config.BASE_URL}/decks`,
				{
					name: deckName.trim(),
					user_id: userId
				},
				{ headers }
			);

			// Éxito
			showToast(`¡Mazo "${deckName}" creado exitosamente!`, 'success');
			
			setTimeout(() => {
				if (onCreateDeck) {
					onCreateDeck(response.data);
				}
				setDeckName("");
				onClose();
			}, 1500);

		} catch (err) {
			const errorMessage = err?.response?.data?.message || err?.message || 'Error al crear el mazo';
			showToast(errorMessage, 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setDeckName("");
		onClose();
	};

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={handleClose}
		>
			<View style={stylesMS.modalOverlay}>
				<View style={stylesMS.modalContainer}>
					{/* Header del modal */}
					<View style={stylesMS.modalHeader}>
						<Text style={stylesMS.modalTitle}>Crear Nuevo Mazo</Text>
						<TouchableOpacity 
							onPress={handleClose}
							style={stylesMS.closeButton}
						>
							<X size={24} color="#000" />
						</TouchableOpacity>
					</View>

					{/* Contenido del modal */}
					<View style={stylesMS.modalContent}>
						<Text style={stylesMS.modalSubtitle}>
							Solo se requiere o tu nuevo mazo de vocabulario
						</Text>

						<Text style={stylesMS.modalLabel}>Nombre del Mazo</Text>
						<TextInput
							style={stylesMS.modalInput}
							placeholder="Ej: Animales, Verbos, Comida..."
							value={deckName}
							onChangeText={setDeckName}
							placeholderTextColor="#999"
							editable={!loading}
						/>
					</View>

					{/* Botones del modal */}
					<View style={stylesMS.modalButtons}>
						<TouchableOpacity 
							style={stylesMS.modalButtonCancel}
							onPress={handleClose}
							disabled={loading}
						>
							<Text style={stylesMS.modalButtonTextCancel}>Cancelar</Text>
						</TouchableOpacity>
						
						<TouchableOpacity 
							style={[
								stylesMS.modalButtonCreate,
								loading && { opacity: 0.6 }
							]}
							onPress={handleCreate}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text style={stylesMS.modalButtonTextCreate}>Crear Mazo</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>

				{/* Toast personalizado */}
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
			</View>
		</Modal>
	);
}
