import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import stylesProfile from '../styles/stylesProfile';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Avatar } from '@rneui/themed';
import { LogOut, Pencil, Check, X, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { config } from '../config/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

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
              console.error('Error al cerrar sesión: - ProfileScreen.js:107', error);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión. Intenta de nuevo.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y toda tu información, progreso y puntos se perderán para siempre.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              const deleteUrl = `${config.BASE_URL}/users/${userId}`;
              
              const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              });

              if (!response.ok) {
                throw new Error('Error al eliminar cuenta');
              }

              // Limpiar todos los datos del SecureStore
              await SecureStore.deleteItemAsync('userInfo');
              await SecureStore.deleteItemAsync('token');

              Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.');

              // Navegar a la pantalla de login y resetear el stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            } catch (error) {
              console.error('Error al eliminar cuenta:', error);
              Alert.alert('Error', 'Hubo un problema al eliminar tu cuenta. Intenta de nuevo.');
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
      const uploadUrl = `${config.BASE_URL}/cloudinary/upload-profile`;
      console.log('Avatar upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Importante: No definir 'Content-Type' aquí, fetch lo genera con el boundary
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Upload error response:', errText);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Actualizar UI/local storage con la nueva URL del avatar si el backend la devuelve
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
      console.error('Upload avatar fetch error:', error);
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
              mediaTypes: ['images'],
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

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('token');
      const updateUrl = `${config.BASE_URL}/users/${userId}`;
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar nombre');
      }

      const updatedUser = await response.json();
      
      const current = userData || {};
      const nextUser = { ...current, name: updatedUser.name || newName.trim() };
      setUserData(nextUser);
      try {
        await SecureStore.setItemAsync('userInfo', JSON.stringify(nextUser));
      } catch {}
      
      setIsEditingName(false);
      Alert.alert('Éxito', 'Nombre actualizado correctamente.');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar el nombre. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView 
      style={stylesProfile.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
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
        
        {isEditingName ? (
          <View style={stylesProfile.nameEditContainer}>
            <TextInput
              style={stylesProfile.nameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              placeholder="Tu nombre"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <TouchableOpacity onPress={handleSaveName} style={stylesProfile.editIconButton}>
              <Check color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingName(false)} style={stylesProfile.editIconButton}>
              <X color="#dc3545" size={24} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={stylesProfile.nameEditContainer}>
            <Text style={stylesProfile.profileTitle}>{userData?.name || 'Usuario Anónimo'}</Text>
            <TouchableOpacity 
              onPress={() => { setIsEditingName(true); setNewName(userData?.name || ''); }} 
              style={stylesProfile.editIconButton}
            >
              <Pencil color="#fff" size={18} />
            </TouchableOpacity>
          </View>
        )}

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

        <TouchableOpacity
          style={stylesProfile.deleteButton}
          onPress={handleDeleteProfile}
        >
          <Trash2 size={20} color="#dc3545" />
          <Text style={stylesProfile.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
