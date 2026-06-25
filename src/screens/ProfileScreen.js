import React, { useState } from 'react';
import { View, ScrollView, Alert, Modal } from 'react-native';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, getUserId } from '../context/AuthContext';
import { getUserStats, getUserAchievements, updateUserName, uploadProfileImage, deleteUser } from '../services/users.service';
import { Image } from 'react-native';
import { LogOut, Pencil, Check, X, Trash2, Settings, BookOpen, GraduationCap, Target, Flame, Calendar, Trophy, Zap, Lock, ChevronRight, Moon, Star, Award, Sun } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Card, Spinner, Typography } from 'heroui-native';
import { useAppTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useAppTheme();
  const { user: authUser, logout, updateUser } = useAuth();
  const userId = getUserId(authUser);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState(authUser);
  const [userStats, setUserStats] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);

  const handleThemeToggle = () => {
    if (theme.mode === 'light') setShowBetaModal(true);
    toggleTheme();
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchUserData = async () => {
        if (!userId) return;
        if (isActive) setUserData(authUser);
        try {
          setIsLoadingStats(true);
          const [statsData, achData] = await Promise.all([
            getUserStats(userId),
            getUserAchievements(userId),
          ]);
          if (isActive) {
            setUserStats(statsData);
            setUserAchievements(achData);
          }
        } catch (e) {
          console.error('Error fetching stats:', e);
        } finally {
          if (isActive) setIsLoadingStats(false);
        }
      };
      fetchUserData();
      return () => { isActive = false; };
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión', style: 'destructive', onPress: async () => {
          try {
            await logout();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
          } catch {
            Alert.alert('Error', 'Hubo un problema al cerrar sesión. Intenta de nuevo.');
          }
        },
      },
    ]);
  };

  const handleDeleteProfile = async () => {
    Alert.alert('Eliminar Cuenta', '¿Estás absolutamente seguro? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, Eliminar Todo', style: 'destructive', onPress: async () => {
          try {
            await deleteUser(userId);
            await logout();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
          } catch {
            Alert.alert('Error', 'Hubo un problema al eliminar tu cuenta. Intenta de nuevo.');
          }
        },
      },
    ]);
  };

  const uploadImage = async (asset) => {
    try {
      const data = await uploadProfileImage(userId, asset);
      const imageUrl = data.imageUrl || data.url || data.secure_url || data.image_url;
      if (imageUrl) {
        await updateUser({ avatar_url: imageUrl });
        setUserData((prev) => ({ ...prev, avatar_url: imageUrl }));
      } else if (data.user) {
        await updateUser(data.user);
        setUserData(data.user);
      }
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
    } catch {
      Alert.alert('Error', 'Hubo un problema al cambiar la foto de perfil. Intenta de nuevo.');
    }
  };

  const handleEditProfile = async () => {
    Alert.alert('Editar Perfil', '¿Quieres cambiar la foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar', onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return Alert.alert('Permiso requerido', 'Se requiere permiso.');
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
            if (!result.canceled && result.assets?.length > 0) await uploadImage(result.assets[0]);
          } catch {
            Alert.alert('Error', 'Hubo un problema al cambiar la foto de perfil. Intenta de nuevo.');
          }
        },
      },
    ]);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 3)
      return Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres.');
    try {
      const updatedUser = await updateUserName(userId, newName.trim());
      const nextName = updatedUser.name || newName.trim();
      await updateUser({ name: nextName });
      setUserData((prev) => ({ ...prev, name: nextName }));
      setIsEditingName(false);
    } catch {
      Alert.alert('Error', 'Hubo un problema al actualizar el nombre. Intenta de nuevo.');
    }
  };

  const totalAnswers = userStats ? (userStats.correct_answers_total + userStats.wrong_answers_total) : 0;
  const precision = totalAnswers > 0 ? Math.round((userStats.correct_answers_total / totalAnswers) * 100) : 0;

  const displayStats = {
    nivel: userStats?.level ?? 1,
    precision: userStats ? precision : 0,
    racha: userStats?.streak_current ?? 0,
    diasActivo: userStats?.quizzes_completed ?? 0,
    puntos: userStats?.points_total ?? 0,
    nextLevelPoints: userStats?.next_level_points ?? 100,
  };

  const primaryColor = theme.colors.primaryLight || theme.colors.primary;

  const renderIcon = (type, color, size) => {
    const icons = { Trophy, Zap, Moon, Star, Flame, Award, Sun, GraduationCap };
    const IconComp = icons[type] || Trophy;
    return <IconComp color={color} size={size} />;
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 8 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 10, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-5 mb-4">
          <View className="flex-row items-center gap-2">
            <BookOpen color={primaryColor} size={24} />
            <Typography type="h5" weight="bold">Engli-Cards</Typography>
          </View>
          <View className="flex-row items-center gap-4">
            <Button isIconOnly variant="ghost" onPress={handleThemeToggle}>
              {theme.mode === 'dark'
                ? <Sun color={primaryColor} size={24} />
                : <Moon color={primaryColor} size={24} />
              }
            </Button>
            {userData?.role === 'admin' && (
              <Button isIconOnly variant="ghost" onPress={() => navigation.navigate('AdminSettings')}>
                <Settings color={primaryColor} size={24} />
              </Button>
            )}
          </View>
        </View>

        {/* Profile Header */}
        <View className="items-center px-5 mb-6">
          <View className="relative mb-3">
            <Button isIconOnly variant="ghost" onPress={handleEditProfile} className="w-24 h-24 rounded-full overflow-hidden">
              {userData?.avatar_url
                ? <Image source={{ uri: userData.avatar_url }} style={{ width: 96, height: 96, borderRadius: 48 }} />
                : (
                  <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: primaryColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Typography type="h2" weight="bold" className="text-white">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </Typography>
                  </View>
                )
              }
            </Button>
            <View className="absolute bottom-0 right-0 bg-accent w-7 h-7 rounded-full items-center justify-center border-2 border-background">
              <Trophy color="#fff" size={12} />
            </View>
          </View>

          <View className="items-center mb-2">
            {isEditingName ? (
              <Input
                className="text-center text-lg font-semibold"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                placeholder="Tu nombre"
              />
            ) : (
              <Typography type="h4" weight="bold">{userData?.name || 'Usuario Anónimo'}</Typography>
            )}

            {isEditingName ? (
              <View className="flex-row gap-3 mt-2">
                <Button isIconOnly variant="ghost" onPress={handleSaveName}>
                  <Check color={primaryColor} size={24} />
                </Button>
                <Button isIconOnly variant="ghost" onPress={() => setIsEditingName(false)}>
                  <X color="#dc3545" size={24} />
                </Button>
              </View>
            ) : (
              <Button isIconOnly variant="ghost" size="sm" onPress={() => { setIsEditingName(true); setNewName(userData?.name || ''); }}>
                <Pencil color={theme.colors.mutedForeground} size={18} />
              </Button>
            )}
          </View>

          <View className="flex-row items-center gap-2 bg-default px-3 py-1.5 rounded-full">
            <View className="bg-accent rounded-lg p-0.5">
              <Trophy color="#fff" size={12} />
            </View>
            <Typography type="body-sm" weight="medium">{displayStats.puntos.toLocaleString()} Puntos totales</Typography>
          </View>
        </View>

        {/* Stats Grid */}
        {isLoadingStats ? (
          <View className="my-5 items-center">
            <Spinner size="lg" />
          </View>
        ) : (
          <View className="flex-row flex-wrap px-4 gap-3 mb-4">
            <Card className="flex-1 min-w-[40%] items-center py-4">
              <Card.Body className="items-center">
                <GraduationCap color={primaryColor} size={28} />
                <Typography type="body-xs" weight="bold" className="uppercase tracking-wider mt-2 mb-1 text-muted">NIVEL ACTUAL</Typography>
                <Typography type="h4" weight="bold">{displayStats.nivel}</Typography>
              </Card.Body>
            </Card>
            <Card className="flex-1 min-w-[40%] items-center py-4">
              <Card.Body className="items-center">
                <Target color="#B45309" size={28} />
                <Typography type="body-xs" weight="bold" className="uppercase tracking-wider mt-2 mb-1 text-muted">PRECISIÓN</Typography>
                <Typography type="h4" weight="bold">{displayStats.precision}%</Typography>
              </Card.Body>
            </Card>
            <Card className="flex-1 min-w-[40%] items-center py-4 bg-accent">
              <Card.Body className="items-center">
                <Flame color="#fff" size={28} />
                <Typography type="body-xs" weight="bold" className="uppercase tracking-wider mt-2 mb-1 text-accent-foreground">RACHA</Typography>
                <Typography type="h4" weight="bold" className="text-accent-foreground">{displayStats.racha} días</Typography>
              </Card.Body>
            </Card>
            <Card className="flex-1 min-w-[40%] items-center py-4">
              <Card.Body className="items-center">
                <Calendar color="#64748B" size={28} />
                <Typography type="body-xs" weight="bold" className="uppercase tracking-wider mt-2 mb-1 text-muted">QUICES HECHOS</Typography>
                <Typography type="h4" weight="bold">{displayStats.diasActivo}</Typography>
              </Card.Body>
            </Card>
          </View>
        )}

        {/* Achievements */}
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Typography type="h5" weight="bold">Logros</Typography>
          <Button variant="ghost" size="sm" onPress={() => setShowAllAchievements(!showAllAchievements)}>
            <Typography type="body-sm" className="text-accent">
              {showAllAchievements ? 'Ver menos' : 'Ver todos'}
            </Typography>
          </Button>
        </View>

        <View className="px-4 mb-4">
          {(showAllAchievements ? userAchievements : userAchievements.slice(0, 3)).map((ach) => {
            const isLocked = !ach.is_completed;
            const progressPercent = Math.min((ach.current_value / ach.target_value) * 100, 100);
            return (
              <Card key={ach.achievement_id} className={`mb-3 ${isLocked ? 'opacity-60' : ''}`}>
                <Card.Body className="flex-row items-center px-4 py-3">
                  <View className="w-10 h-10 rounded-full bg-default items-center justify-center mr-3">
                    {isLocked
                      ? <Lock color={theme.colors.mutedForeground} size={20} />
                      : renderIcon(ach.icon_type, primaryColor, 20)
                    }
                  </View>
                  <View className="flex-1">
                    <Typography type="body" weight="semibold">{ach.title}</Typography>
                    <Typography type="body-sm" color="muted">{ach.description}</Typography>
                    <View className="h-1.5 bg-border rounded-full mt-2">
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${progressPercent}%`, backgroundColor: isLocked ? theme.colors.mutedForeground : primaryColor }}
                      />
                    </View>
                  </View>
                  {isLocked
                    ? <Lock color={theme.colors.mutedForeground} size={18} style={{ marginLeft: 8 }} />
                    : <ChevronRight color={theme.colors.mutedForeground} size={20} style={{ marginLeft: 8 }} />
                  }
                </Card.Body>
              </Card>
            );
          })}
          {userAchievements.length === 0 && !isLoadingStats && (
            <Typography type="body" color="muted" align="center" className="my-5">No hay logros disponibles aún.</Typography>
          )}
        </View>

        {/* Next Level Card */}
        {!isLoadingStats && (
          <Card className="mx-4 mb-4">
            <Card.Body className="px-4 py-4">
              <View className="flex-row justify-between items-center mb-2">
                <Typography type="body" weight="semibold">Próximo Nivel: {displayStats.nivel + 1}</Typography>
                <Typography type="body-sm" color="muted">{100 - displayStats.nextLevelPoints} / 100 XP</Typography>
              </View>
              <View className="h-2 bg-border rounded-full mb-2">
                <View className="h-full bg-accent rounded-full" style={{ width: `${100 - displayStats.nextLevelPoints}%` }} />
              </View>
              <Typography type="body-sm" color="muted">¡Solo te faltan {displayStats.nextLevelPoints} XP para subir de nivel!</Typography>
            </Card.Body>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="px-4 gap-3 mt-2">
          <Button variant="outline" size="lg" className="w-full" onPress={handleLogout}>
            <LogOut size={20} color={theme.colors.primaryDark || theme.colors.foreground} />
            <Button.Label>Cerrar Sesión</Button.Label>
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onPress={handleDeleteProfile}>
            <Trash2 size={16} color="#dc3545" />
            <Button.Label className="text-danger">Eliminar Cuenta</Button.Label>
          </Button>
        </View>
      </ScrollView>

      {/* Beta Warning Modal */}

      <Modal animationType="fade" transparent visible={showBetaModal} onRequestClose={() => setShowBetaModal(false)}>
        <View className="flex-1 bg-backdrop items-center justify-center px-8">
          <Card className="w-full items-center">
            <Card.Body className="items-center py-8 px-6">
              <View className="bg-accent/20 p-4 rounded-3xl mb-4">
                <Zap color={primaryColor} size={32} />
              </View>
              <Typography type="h4" weight="bold" className="mb-3">Modo Beta</Typography>
              <Typography type="body" color="muted" align="center" className="mb-6 leading-6">
                Oye, el modo oscuro está en modo beta, pueden haber errores.
              </Typography>
              <Button size="lg" className="w-full" onPress={() => setShowBetaModal(false)}>
                <Button.Label>Entendido</Button.Label>
              </Button>
            </Card.Body>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
