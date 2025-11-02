import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import stylesProfile from '../styles/stylesProfile';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Avatar } from '@rneui/themed';
import { LogOut } from 'lucide-react-native';

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

  return (
    <ScrollView style={stylesProfile.container}>
      {/* Encabezado */}
      <View style={stylesProfile.header}>
        <View style={stylesProfile.avatarContainer}>
          <Avatar
            rounded
            size="large"
            title={userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            containerStyle={{ backgroundColor: '#111a2eff' }}
          />
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
