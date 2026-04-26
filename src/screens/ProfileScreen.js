import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import stylesProfile from '../styles/stylesProfile';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { Avatar } from '@rneui/themed';
import { LogOut, Pencil, Check, X, Trash2, Settings, BookOpen, GraduationCap, Target, Flame, Calendar, Trophy, Zap, Lock, ChevronRight, Moon, Star, Award, Sun } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { config } from '../config/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchUserData = async () => {
        try {
          const storedUser = await SecureStore.getItemAsync('userInfo');
          if (!storedUser) {
            if (isActive) setError('No se encontró información del usuario. Inicia sesión nuevamente.');
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

          // Fetch stats from backend
          const token = await SecureStore.getItemAsync('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
          
          try {
            setIsLoadingStats(true);
            const [statsRes, achRes] = await Promise.all([
              fetch(`${config.BASE_URL}/users/${userIdValue}/stats`, { headers }),
              fetch(`${config.BASE_URL}/users/${userIdValue}/achievements`, { headers })
            ]);

            if (statsRes.ok) {
              const statsData = await statsRes.json();
              if (isActive) setUserStats(statsData);
            }

            if (achRes.ok) {
              const achData = await achRes.json();
              if (isActive) setUserAchievements(achData);
            }
          } catch (e) {
            console.error('Error fetching stats or achievements:', e);
          } finally {
            if (isActive) setIsLoadingStats(false);
          }

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
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión', style: 'destructive', onPress: async () => {
          try {
            await SecureStore.deleteItemAsync('userInfo');
            await SecureStore.deleteItemAsync('token');
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
          } catch (error) {
            Alert.alert('Error', 'Hubo un problema al cerrar sesión. Intenta de nuevo.');
          }
        }
      }
    ]);
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Eliminar Todo', style: 'destructive', onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              const deleteUrl = `${config.BASE_URL}/users/${userId}`;
              const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              });
              if (!response.ok) throw new Error('Error al eliminar cuenta');
              await SecureStore.deleteItemAsync('userInfo');
              await SecureStore.deleteItemAsync('token');
              Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.');
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
            } catch (error) {
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
      const uri = asset.uri;
      const ext = (uri?.split('.')?.pop() || 'jpg').toLowerCase();
      const mime = asset.mimeType || (ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg');
      const name = asset.fileName || `avatar.${ext}`;

      formData.append('avatar', { uri, name, type: mime });
      if (userId) formData.append('userId', String(userId));

      const token = await SecureStore.getItemAsync('token');
      const uploadUrl = `${config.BASE_URL}/cloudinary/upload-profile`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const imageUrl = data.imageUrl || data.url || data.secure_url || data.image_url;

      if (imageUrl) {
        const nextUser = { ...userData, avatar_url: imageUrl };
        setUserData(nextUser);
        try { await SecureStore.setItemAsync('userInfo', JSON.stringify(nextUser)); } catch {}
      } else if (data.user) {
        setUserData(data.user);
        try { await SecureStore.setItemAsync('userInfo', JSON.stringify(data.user)); } catch {}
      }
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cambiar la foto de perfil. Intenta de nuevo.');
    }
  }

  const handleEditProfile = async () => {
    Alert.alert('Editar Perfil', '¿Quieres cambiar la foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return Alert.alert('Permiso requerido', 'Se requiere permiso.');
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
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
    if (!newName.trim() || newName.trim().length < 3) return Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres.');
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await fetch(`${config.BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) throw new Error('Error al actualizar nombre');
      const updatedUser = await response.json();
      const nextUser = { ...userData, name: updatedUser.name || newName.trim() };
      setUserData(nextUser);
      try { await SecureStore.setItemAsync('userInfo', JSON.stringify(nextUser)); } catch {}
      
      setIsEditingName(false);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al actualizar el nombre. Intenta de nuevo.');
    }
  };

  // Calcular precisión
  const totalAnswers = userStats ? (userStats.correct_answers_total + userStats.wrong_answers_total) : 0;
  const precision = totalAnswers > 0 ? Math.round((userStats.correct_answers_total / totalAnswers) * 100) : 0;

  // Defaults fallback
  const fallbackStats = {
    nivel: 1,
    precision: 0,
    racha: 0,
    diasActivo: 0,
    puntos: 0,
  };

  const displayStats = {
    nivel: userStats?.level ?? fallbackStats.nivel,
    precision: userStats ? precision : fallbackStats.precision,
    racha: userStats?.streak_current ?? fallbackStats.racha,
    diasActivo: userStats?.quizzes_completed ?? fallbackStats.diasActivo,
    puntos: userStats?.points_total ?? fallbackStats.puntos,
    nextLevelPoints: userStats?.next_level_points ?? 100,
  };

  const primaryColor = theme.colors.primaryLight || theme.colors.primary;

  const renderIcon = (type, color, size) => {
    switch (type) {
      case 'Trophy': return <Trophy color={color} size={size} />;
      case 'Zap': return <Zap color={color} size={size} />;
      case 'Moon': return <Moon color={color} size={size} />;
      case 'Star': return <Star color={color} size={size} />;
      case 'Flame': return <Flame color={color} size={size} />;
      case 'Award': return <Award color={color} size={size} />;
      case 'Sun': return <Sun color={color} size={size} />;
      case 'GraduationCap': return <GraduationCap color={color} size={size} />;
      default: return <Trophy color={color} size={size} />;
    }
  };

  return (
    <ScrollView 
      style={stylesProfile.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={stylesProfile.topBar}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <BookOpen color={primaryColor} size={24} />
          <Text style={stylesProfile.topBarTitle}>Engli-Cards</Text>
        </View>
        <TouchableOpacity onPress={() => {/* Go to settings if needed */}}>
          <Settings color={primaryColor} size={24} />
        </TouchableOpacity>
      </View>

      {/* Header Info */}
      <View style={stylesProfile.header}>
        <View style={stylesProfile.avatarContainer}>
          <TouchableOpacity onPress={handleEditProfile} activeOpacity={0.8}>
            {userData && userData?.avatar_url ? (
              <Avatar rounded size={96} source={{ uri: userData.avatar_url }} />
            ) : (
              <Avatar rounded size={96} title={userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'} containerStyle={{ backgroundColor: primaryColor }} />
            )}
          </TouchableOpacity>
          <View style={stylesProfile.avatarBadge}>
            <Trophy color="#fff" size={12} />
          </View>
        </View>
        
        {isEditingName ? (
          <View style={stylesProfile.nameEditContainer}>
            <TextInput
              style={stylesProfile.nameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              placeholder="Tu nombre"
              placeholderTextColor="rgba(0,0,0,0.3)"
            />
            <TouchableOpacity onPress={handleSaveName} style={stylesProfile.editIconButton}>
              <Check color={primaryColor} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingName(false)} style={stylesProfile.editIconButton}>
              <X color="#dc3545" size={24} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={stylesProfile.nameEditContainer}>
            <Text style={stylesProfile.profileTitle}>{userData?.name || 'Usuario Anónimo'}</Text>
            <TouchableOpacity onPress={() => { setIsEditingName(true); setNewName(userData?.name || ''); }} style={stylesProfile.editIconButton}>
              <Pencil color={theme.colors.mutedForeground} size={16} />
            </TouchableOpacity>
          </View>
        )}

        <View style={stylesProfile.pointsContainer}>
          <View style={{backgroundColor: primaryColor, borderRadius: 10, padding: 2}}>
            <Trophy color="#fff" size={12} />
          </View>
          <Text style={stylesProfile.points}>{displayStats.puntos.toLocaleString()} Total Points</Text>
        </View>
      </View>

      {/* Grid Estadísticas */}
      {isLoadingStats ? (
        <ActivityIndicator size="large" color={primaryColor} style={{marginVertical: 20}} />
      ) : (
        <View style={stylesProfile.statsContainer}>
          {/* NIVEL */}
          <View style={stylesProfile.statBox}>
            <GraduationCap color={primaryColor} size={28} style={stylesProfile.statIcon} />
            <Text style={stylesProfile.statLabel}>NIVEL ACTUAL</Text>
            <Text style={stylesProfile.statValue}>{displayStats.nivel}</Text>
          </View>
          
          {/* PRECISION */}
          <View style={stylesProfile.statBox}>
            <Target color="#B45309" size={28} style={stylesProfile.statIcon} />
            <Text style={stylesProfile.statLabel}>PRECISIÓN</Text>
            <Text style={stylesProfile.statValue}>{displayStats.precision}%</Text>
          </View>
          
          {/* RACHA */}
          <View style={[stylesProfile.statBox, stylesProfile.statBoxActive]}>
            <Flame color="#fff" size={28} style={stylesProfile.statIcon} />
            <Text style={[stylesProfile.statLabel, stylesProfile.statLabelActive]}>RACHA</Text>
            <Text style={[stylesProfile.statValue, stylesProfile.statValueActive]}>{displayStats.racha} días</Text>
          </View>
          
          {/* DIAS ACTIVO */}
          <View style={stylesProfile.statBox}>
            <Calendar color="#64748B" size={28} style={stylesProfile.statIcon} />
            <Text style={stylesProfile.statLabel}>QUICES HECHOS</Text>
            <Text style={stylesProfile.statValue}>{displayStats.diasActivo}</Text>
          </View>
        </View>
      )}

      {/* Logros */}
      <View style={stylesProfile.sectionHeader}>
        <Text style={stylesProfile.sectionTitle}>Logros</Text>
        <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
          <Text style={stylesProfile.sectionLink}>{showAllAchievements ? 'Ver menos' : 'Ver todos'}</Text>
        </TouchableOpacity>
      </View>

      <View style={stylesProfile.achievementsList}>
        {(showAllAchievements ? userAchievements : userAchievements.slice(0, 3)).map((ach) => {
          const isLocked = !ach.is_completed;
          const progressPercent = Math.min((ach.current_value / ach.target_value) * 100, 100);

          return (
            <View key={ach.achievement_id} style={[stylesProfile.achievementRow, isLocked && stylesProfile.achievementLocked]}>
              <View style={stylesProfile.achievementIconContainer}>
                {isLocked ? (
                  <Lock color={theme.colors.mutedForeground} size={20} />
                ) : (
                  renderIcon(ach.icon_type, primaryColor, 20)
                )}
              </View>
              <View style={stylesProfile.achievementTextContainer}>
                <Text style={stylesProfile.achievementTitle}>{ach.title}</Text>
                <Text style={stylesProfile.achievementDesc}>{ach.description}</Text>
                {!isLocked ? (
                  <View style={stylesProfile.progressContainer}>
                    <View style={[stylesProfile.progressBar, { width: `${progressPercent}%` }]} />
                  </View>
                ) : (
                  <View style={stylesProfile.progressContainer}>
                    <View style={[stylesProfile.progressBar, { width: `${progressPercent}%`, backgroundColor: theme.colors.mutedForeground }]} />
                  </View>
                )}
              </View>
              {isLocked ? (
                <Lock color={theme.colors.mutedForeground} size={18} style={stylesProfile.achievementRight} />
              ) : (
                <ChevronRight color={theme.colors.mutedForeground} size={20} style={stylesProfile.achievementRight} />
              )}
            </View>
          );
        })}
        {userAchievements.length === 0 && !isLoadingStats && (
          <Text style={{ textAlign: 'center', color: theme.colors.mutedForeground, marginVertical: 20 }}>No hay logros disponibles aún.</Text>
        )}
      </View>

      {/* Próximo Nivel Card */}
      {!isLoadingStats && (
        <View style={stylesProfile.levelCard}>
          <View style={stylesProfile.levelHeaderRow}>
            <Text style={stylesProfile.levelTitle}>Próximo Nivel: {displayStats.nivel + 1}</Text>
            <Text style={stylesProfile.levelXp}>{100 - displayStats.nextLevelPoints} / 100 XP</Text>
          </View>
          <View style={stylesProfile.levelProgressBg}>
            <View style={[stylesProfile.levelProgressFill, { width: `${100 - displayStats.nextLevelPoints}%` }]} />
          </View>
          <Text style={stylesProfile.levelHint}>¡Solo te faltan {displayStats.nextLevelPoints} XP para subir de nivel!</Text>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={stylesProfile.logoutContainer}>
        <TouchableOpacity style={stylesProfile.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.primaryDark || theme.colors.foreground} />
          <Text style={stylesProfile.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={stylesProfile.deleteButton} onPress={handleDeleteProfile}>
          <Trash2 size={16} color="#dc3545" />
          <Text style={stylesProfile.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
