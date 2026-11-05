import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LogOut, Pencil, Check, X, Trash2, Settings, BookOpen, GraduationCap, Target, Flame, Calendar,
  Trophy, Zap, Lock, Moon, Star, Award, Sun, Camera,
} from 'lucide-react-native';
import { Button, Input, Spinner, Typography } from 'heroui-native';
import { useAuth, getUserId } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useNetwork } from '../context/NetworkContext';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getUserStats, getUserAchievements, updateUserName, uploadProfileImage, deleteUser } from '../services/users.service';
import { getErrorMessage } from '../utils/errors';
import { pickImageFromLibrary } from '../utils/imagePicker';
import CachedImage from '../components/CachedImage';
import IconButton from '../components/ui/IconButton';
import PressableScale from '../components/ui/PressableScale';
import { elevation } from '../theme/theme';

const ACHIEVEMENT_ICONS = { Trophy, Zap, Moon, Star, Flame, Award, Sun, GraduationCap };

function StatTile({ icon: Icon, iconColor, label, value, highlighted = false }) {
  const { theme } = useAppTheme();
  return (
    <View
      className={`min-w-[44%] flex-1 items-center rounded-2xl border py-4 ${highlighted ? 'border-transparent bg-accent' : 'border-border bg-surface'}`}
      style={elevation(1, theme.mode)}
    >
      <Icon color={highlighted ? theme.colors.onPrimary : iconColor} size={26} />
      <Typography
        type="body-xs"
        weight="bold"
        className={`mb-0.5 mt-2 uppercase tracking-wider ${highlighted ? 'text-accent-foreground' : 'text-muted'}`}
      >
        {label}
      </Typography>
      <Typography type="h4" weight="bold" className={highlighted ? 'text-accent-foreground' : ''}>{value}</Typography>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, toggleTheme } = useAppTheme();
  const { user: authUser, logout, updateUser } = useAuth();
  const userId = getUserId(authUser);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isOnline, sync } = useNetwork();
  const feedback = useFeedback();
  const { toast, confirm, alert } = feedback;

  const [userData, setUserData] = useState(authUser);
  const [userStats, setUserStats] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchUserData = async () => {
        if (!userId) return;
        setUserData(authUser);
        try {
          const [statsResult, achResult] = await Promise.all([
            getUserStats(userId),
            getUserAchievements(userId),
          ]);
          if (isActive) {
            setUserStats(statsResult.data);
            setUserAchievements(achResult.data ?? []);
          }
        } catch (e) {
          console.warn('No se pudieron cargar las estadísticas:', e?.message ?? e);
        } finally {
          if (isActive) setIsLoadingStats(false);
        }
      };
      fetchUserData();
      return () => { isActive = false; };
    }, [userId, authUser]),
  );

  const handleThemeToggle = () => {
    const enablingDark = theme.mode === 'light';
    toggleTheme();
    if (enablingDark) {
      alert({
        title: 'Modo oscuro (beta)',
        message: 'El modo oscuro todavía está en pruebas: puede que algunos detalles no se vean perfectos.',
        icon: Zap,
      });
    }
  };

  /** Las acciones de cuenta necesitan servidor: avisa en lugar de fallar. */
  const requireOnline = (action) => {
    if (isOnline) return true;
    toast.offline('Necesitas conexión', { message: `Conéctate a Internet para ${action}.` });
    return false;
  };

  const resetToHome = () =>
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));

  const handleLogout = async () => {
    const pendingNote = sync.pending > 0
      ? ` Tienes ${sync.pending} ${sync.pending === 1 ? 'cambio' : 'cambios'} sin sincronizar: quedarán guardados en este dispositivo y se enviarán cuando vuelvas a entrar.`
      : '';
    const ok = await confirm({
      title: '¿Cerrar sesión?',
      message: `Podrás volver a entrar cuando quieras.${pendingNote}`,
      confirmText: 'Cerrar sesión',
      icon: LogOut,
    });
    if (!ok) return;
    try {
      await logout();
      resetToHome();
    } catch {
      toast.error('No se pudo cerrar sesión', { message: 'Intenta de nuevo.' });
    }
  };

  const handleDeleteProfile = async () => {
    if (!requireOnline('eliminar tu cuenta')) return;
    const ok = await confirm({
      title: '¿Eliminar tu cuenta?',
      message: 'Se borrarán tu progreso, mazos y tarjetas. Esta acción es irreversible.',
      confirmText: 'Sí, eliminar todo',
      destructive: true,
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await deleteUser(userId);
      await logout();
      resetToHome();
    } catch (err) {
      toast.error('No se pudo eliminar tu cuenta', { message: getErrorMessage(err) });
    }
  };

  const handleChangeAvatar = async () => {
    if (uploadingAvatar || !requireOnline('cambiar tu foto de perfil')) return;
    const asset = await pickImageFromLibrary(feedback, { aspect: [1, 1], quality: 0.9 });
    if (!asset) return;
    setUploadingAvatar(true);
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
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      toast.error('No se pudo cambiar la foto', { message: getErrorMessage(err) });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const startEditingName = () => {
    setNewName(userData?.name || '');
    setNameError(null);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const name = newName.trim();
    if (name.length < 3) { setNameError('El nombre debe tener al menos 3 caracteres.'); return; }
    if (!requireOnline('cambiar tu nombre')) return;
    setSavingName(true);
    try {
      const updatedUser = await updateUserName(userId, name);
      const nextName = updatedUser?.name || name;
      await updateUser({ name: nextName });
      setUserData((prev) => ({ ...prev, name: nextName }));
      setIsEditingName(false);
      toast.success('Nombre actualizado');
    } catch (err) {
      setNameError(getErrorMessage(err, 'No se pudo actualizar el nombre.'));
    } finally {
      setSavingName(false);
    }
  };

  const totalAnswers = userStats ? (userStats.correct_answers_total + userStats.wrong_answers_total) : 0;
  const precision = totalAnswers > 0 ? Math.round((userStats.correct_answers_total / totalAnswers) * 100) : 0;

  const displayStats = {
    nivel: userStats?.level ?? 1,
    precision: userStats ? precision : 0,
    racha: userStats?.streak_current ?? 0,
    quizzes: userStats?.quizzes_completed ?? 0,
    puntos: userStats?.points_total ?? 0,
    nextLevelPoints: userStats?.next_level_points ?? 100,
  };
  const levelProgress = Math.max(0, Math.min(100, 100 - displayStats.nextLevelPoints));
  const visibleAchievements = showAllAchievements ? userAchievements : userAchievements.slice(0, 3);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barra superior */}
        <View className="mb-4 h-14 flex-row items-center justify-between px-5">
          <View className="flex-row items-center gap-2">
            <BookOpen color={theme.colors.primary} size={22} />
            <Typography type="body" weight="bold">Engli-Cards</Typography>
          </View>
          <View className="flex-row items-center gap-2">
            <IconButton
              variant="soft"
              accessibilityLabel={theme.mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              onPress={handleThemeToggle}
            >
              {theme.mode === 'dark'
                ? <Sun color={theme.colors.foreground} size={20} />
                : <Moon color={theme.colors.foreground} size={20} />}
            </IconButton>
            {userData?.role === 'admin' ? (
              <IconButton variant="soft" accessibilityLabel="Panel de administración" onPress={() => navigation.navigate('AdminSettings')}>
                <Settings color={theme.colors.foreground} size={20} />
              </IconButton>
            ) : null}
          </View>
        </View>

        {/* Cabecera de perfil */}
        <View className="mb-6 items-center px-5">
          <View className="relative mb-3">
            <PressableScale
              onPress={handleChangeAvatar}
              accessibilityLabel="Cambiar foto de perfil"
              className="h-24 w-24 overflow-hidden rounded-full"
            >
              {userData?.avatar_url ? (
                <CachedImage uri={userData.avatar_url} style={{ width: 96, height: 96 }} contentFit="cover" />
              ) : (
                <View className="h-24 w-24 items-center justify-center bg-accent">
                  <Typography type="h2" weight="bold" className="text-accent-foreground">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Typography>
                </View>
              )}
              {uploadingAvatar ? (
                <View className="absolute inset-0 items-center justify-center bg-black/40">
                  <Spinner color="#fff" size="sm" />
                </View>
              ) : null}
            </PressableScale>
            <View
              pointerEvents="none"
              className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent"
            >
              <Camera color={theme.colors.onPrimary} size={14} />
            </View>
          </View>

          {isEditingName ? (
            <View className="items-center">
              <Input
                className="min-w-[220px] text-center text-lg font-semibold"
                value={newName}
                onChangeText={(text) => { setNewName(text); setNameError(null); }}
                autoFocus
                editable={!savingName}
                placeholder="Tu nombre"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                maxLength={40}
              />
              {nameError ? <Typography type="body-xs" className="mt-1.5 text-danger">{nameError}</Typography> : null}
              <View className="mt-2 flex-row gap-3">
                <IconButton variant="soft" accessibilityLabel="Guardar nombre" onPress={handleSaveName} disabled={savingName}>
                  {savingName ? <Spinner size="sm" /> : <Check color={theme.colors.primary} size={20} />}
                </IconButton>
                <IconButton variant="soft" accessibilityLabel="Cancelar edición" onPress={() => setIsEditingName(false)} disabled={savingName}>
                  <X color={theme.colors.danger} size={20} />
                </IconButton>
              </View>
            </View>
          ) : (
            <PressableScale
              onPress={startEditingName}
              haptic={null}
              scaleTo={0.98}
              accessibilityLabel="Editar nombre"
              className="flex-row items-center gap-1.5 px-2 py-1"
            >
              <Typography type="h4" weight="bold">{userData?.name || 'Usuario'}</Typography>
              <Pencil color={theme.colors.subtle} size={15} />
            </PressableScale>
          )}

          <View className="mt-2 flex-row items-center gap-2 rounded-full bg-default px-3 py-1.5">
            <View className="rounded-md bg-accent p-0.5">
              <Trophy color={theme.colors.onPrimary} size={12} />
            </View>
            <Typography type="body-sm" weight="medium">{displayStats.puntos.toLocaleString()} puntos totales</Typography>
          </View>
        </View>

        {/* Estadísticas */}
        {isLoadingStats ? (
          <View className="my-6 items-center"><Spinner size="lg" /></View>
        ) : (
          <View className="mb-6 flex-row flex-wrap gap-3 px-4">
            <StatTile icon={GraduationCap} iconColor={theme.colors.primary} label="Nivel actual" value={displayStats.nivel} />
            <StatTile icon={Target} iconColor={theme.colors.warning} label="Precisión" value={`${displayStats.precision}%`} />
            <StatTile icon={Flame} label="Racha" value={`${displayStats.racha} días`} highlighted />
            <StatTile icon={Calendar} iconColor={theme.colors.muted} label="Quizzes hechos" value={displayStats.quizzes} />
          </View>
        )}

        {/* Logros */}
        <View className="mb-3 flex-row items-center justify-between px-5">
          <Typography type="h6" weight="bold">Logros</Typography>
          {userAchievements.length > 3 ? (
            <PressableScale onPress={() => setShowAllAchievements(!showAllAchievements)} haptic={null} hitSlop={8}>
              <Typography type="body-sm" weight="semibold" className="text-accent">
                {showAllAchievements ? 'Ver menos' : 'Ver todos'}
              </Typography>
            </PressableScale>
          ) : null}
        </View>

        <View className="mb-6 gap-2.5 px-4">
          {visibleAchievements.map((ach) => {
            const isLocked = !ach.is_completed;
            const progressPercent = Math.min((ach.current_value / ach.target_value) * 100, 100) || 0;
            const Icon = ACHIEVEMENT_ICONS[ach.icon_type] || Trophy;
            return (
              <View
                key={ach.achievement_id}
                className={`flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3.5 ${isLocked ? 'opacity-70' : ''}`}
              >
                <View className={`mr-3 h-11 w-11 items-center justify-center rounded-full ${isLocked ? 'bg-default' : 'bg-accent/10'}`}>
                  {isLocked
                    ? <Lock color={theme.colors.subtle} size={18} />
                    : <Icon color={theme.colors.primary} size={20} />}
                </View>
                <View className="flex-1">
                  <Typography type="body" weight="semibold">{ach.title}</Typography>
                  <Typography type="body-xs" color="muted" className="mt-0.5">{ach.description}</Typography>
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-default">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${progressPercent}%`, backgroundColor: isLocked ? theme.colors.subtle : theme.colors.primary }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
          {userAchievements.length === 0 && !isLoadingStats ? (
            <Typography type="body-sm" color="muted" align="center" className="my-4">Aún no hay logros disponibles.</Typography>
          ) : null}
        </View>

        {/* Próximo nivel */}
        {!isLoadingStats ? (
          <View className="mx-4 mb-6 rounded-2xl border border-border bg-surface px-4 py-4" style={elevation(1, theme.mode)}>
            <View className="mb-2 flex-row items-center justify-between">
              <Typography type="body" weight="semibold">Próximo nivel: {displayStats.nivel + 1}</Typography>
              <Typography type="body-sm" color="muted">{levelProgress} / 100 XP</Typography>
            </View>
            <View className="mb-2 h-2 overflow-hidden rounded-full bg-default">
              <View className="h-full rounded-full bg-accent" style={{ width: `${levelProgress}%` }} />
            </View>
            <Typography type="body-xs" color="muted">
              ¡Te faltan {displayStats.nextLevelPoints} XP para subir de nivel!
            </Typography>
          </View>
        ) : null}

        {/* Acciones */}
        <View className="gap-2 px-4">
          <Button variant="secondary" size="lg" className="w-full" onPress={handleLogout}>
            <LogOut size={18} color={theme.colors.foreground} />
            <Button.Label className="text-foreground">Cerrar sesión</Button.Label>
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onPress={handleDeleteProfile}>
            <Trash2 size={15} color={theme.colors.danger} />
            <Button.Label className="text-danger">Eliminar cuenta</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
