import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import stylesProfile from '../styles/stylesProfile';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Avatar } from '@rneui/themed';
import { LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { config } from '../config/api';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const userDatatemp = {
    nivel: 12,
    precision: 87,
    racha: 28,
    diasActivo: 156,
    puntos: 2340,
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchUserData = async () => {
        try {
          // Obtener el userInfo desde SecureStore
          const storedUser = await SecureStore.getItemAsync('userInfo');
          if (!storedUser) {
            if (isActive) {
              setError('No se encontró información del usuario. Inicia sesión nuevamente.');
            }
            return;
          }

          const user = JSON.parse(storedUser);
          const userIdValue = user?.user_id ?? user?._id ?? user?.id ?? user?.userId;

          if (!userIdValue) {
            if (isActive) {
              setError('No se encontró el ID de usuario.');
              setUserData(null);
            }
            return;
          }

          if (isActive) {
            setUserId(userIdValue);
            setUserData(user);
          }

          // Obtener token si existe
          const token = await SecureStore.getItemAsync('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

          // Aquí puedes hacer llamadas al backend si es necesario
        } catch (error) {
          if (isActive) {
            setError('Error al obtener la información del usuario.');
            setUserData(null);
          }
        }
      };

      fetchUserData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpiar todos los datos del SecureStore
              await SecureStore.deleteItemAsync('userInfo');
              await SecureStore.deleteItemAsync('token');

              // Navegar a la pantalla de login y resetear el stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            } catch (error) {
              console.error('Error al cerrar sesión: - ProfileScreen.js:102', error);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión. Intenta de nuevo.');
            }
          }
        }
      ]
    );
  };

  const uploadImage = async (asset) => {
    try {
      const formData = new FormData();

      // Resolver nombre y tipo de archivo de forma segura en expo-image-picker
      const uri = asset.uri;
      const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
      const mime = asset.mimeType || (ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg');
      const name = asset.fileName || `avatar.${ext}`;

      formData.append('avatar', {
        uri,
        name,
        type: mime,
      });
      if (userId) {
        formData.append('userId', String(userId));
      }

      // Token opcional por si el backend requiere autenticación
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(
        `${config.BASE_URL}/cloudinary/upload-profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      // Actualizar UI/local storage con la nueva URL del avatar si el backend la devuelve
      const data = response?.data || {};
      // La API devuelve { message, imageUrl }
      const imageUrl = data.imageUrl || data.url || data.secure_url || data.image_url;

      if (imageUrl) {
        // Actualiza el usuario persistido agregando la nueva URL
        const current = userData || {};
        const nextUser = {
          ...current,
          avatar_url: imageUrl, // usado por el render
          avarat_url: imageUrl, // compatibilidad si viene con typo en datos previos
          avatarUrl: imageUrl,  // alias en front si se usa en otros lados
        };
        setUserData(nextUser);
        try {
          await SecureStore.setItemAsync('userInfo', JSON.stringify(nextUser));
        } catch {}
      } else if (data.user) {
        // En caso de que el backend devuelva el usuario completo
        setUserData(data.user);
        try {
          await SecureStore.setItemAsync('userInfo', JSON.stringify(data.user));
        } catch {}
      }

      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
    } catch (error) {
      console.error('Upload avatar error - ProfileScreen:', error?.response?.data || error?.message || error);
      Alert.alert('Error', 'Hubo un problema al cambiar la foto de perfil. Intenta de nuevo.');
    }
  }
  const handleEditProfile = async () => {
    Alert.alert('Editar Perfil', 'Quieres cambiar la foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar', style: '', onPress: async () => {
          try {
            // Solicitar permisos para acceder a la galería
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la galería.');
              return;
            }

            // Abrir la galería para escoger una imagen
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.9,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              await uploadImage(result.assets[0]);
            }
          } catch (error) {
            Alert.alert('Error', 'Hubo un problema al cambiar la foto de perfil. Intenta de nuevo.');
          }
        }
      }
    ]);
  }

  return (
    <ScrollView style={stylesProfile.container}>
      {/* Encabezado */}
      <View style={stylesProfile.header}>
        <View style={stylesProfile.avatarContainer}>
          <TouchableOpacity onPress={handleEditProfile} activeOpacity={0.8}>
            {userData && userData?.avatar_url ? (
              <Avatar
                rounded
                size={96}
                source={{ uri: userData.avatar_url }}
              />
            ) : (
              <Avatar
                rounded
                size={96}
                title={userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                containerStyle={{ backgroundColor: '#584fd6ff' }}
              />
            )}
          </TouchableOpacity>
        </View>
        <Text style={stylesProfile.profileTitle}>{userData?.name || 'Usuario Anónimo'}</Text>
        <Text style={stylesProfile.points}>{userDatatemp.puntos.toLocaleString()} puntos totales</Text>
      </View>

      {/* Estadísticas principales */}
      <View style={stylesProfile.statsContainer}>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Nivel</Text>
          <Text style={stylesProfile.statValue}>{userDatatemp.nivel}</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Precisión</Text>
          <Text style={stylesProfile.statValue}>{userDatatemp.precision}%</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Racha</Text>
          <Text style={stylesProfile.statValue}>{userDatatemp.racha} días</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Días activo</Text>
          <Text style={stylesProfile.statValue}>{userDatatemp.diasActivo}</Text>
        </View>
      </View>

      {/* Logros */}
      <View style={stylesProfile.section}>
        <Text style={stylesProfile.sectionTitle}>🏆 Logros</Text>

        <View style={stylesProfile.achievementsContainer}>
          <View style={stylesProfile.achievementCard}>
            <Text style={stylesProfile.achievementIcon}>🎯</Text>
            <Text style={stylesProfile.achievementTitle}>Primera Palabra</Text>
            <Text style={stylesProfile.achievementText}>Aprendiste tu primera palabra</Text>
          </View>

          <View style={stylesProfile.achievementCard}>
            <Text style={stylesProfile.achievementIcon}>🔥</Text>
            <Text style={stylesProfile.achievementTitle}>Racha de 7 días</Text>
            <Text style={stylesProfile.achievementText}>Estudiaste 7 días seguidos</Text>
          </View>

          <View style={[stylesProfile.achievementCard, stylesProfile.achievementLocked]}>
            <Text style={stylesProfile.achievementIcon}>💪</Text>
            <Text style={stylesProfile.achievementTitle}>Racha de 30 días</Text>
            <Text style={stylesProfile.achievementText}>Estudiaste 30 días seguidos</Text>
          </View>

          <View style={stylesProfile.achievementCard}>
            <Text style={stylesProfile.achievementIcon}>🏅</Text>
            <Text style={stylesProfile.achievementTitle}>Maestro del Quiz</Text>
            <Text style={stylesProfile.achievementText}>Completaste 50 quizes</Text>
          </View>

          <View style={[stylesProfile.achievementCard, stylesProfile.achievementLocked]}>
            <Text style={stylesProfile.achievementIcon}>🌍</Text>
            <Text style={stylesProfile.achievementTitle}>Políglota</Text>
            <Text style={stylesProfile.achievementText}>Aprendiste 500 palabras</Text>
          </View>

          <View style={[stylesProfile.achievementCard, stylesProfile.achievementLocked]}>
            <Text style={stylesProfile.achievementIcon}>✨</Text>
            <Text style={stylesProfile.achievementTitle}>Perfeccionista</Text>
            <Text style={stylesProfile.achievementText}>Obtuviste 100% en 10 quizes</Text>
          </View>
        </View>
      </View>

      {/* Botón de Logout */}
      <View style={stylesProfile.logoutContainer}>
        <TouchableOpacity
          style={stylesProfile.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#fff" />
          <Text style={stylesProfile.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
