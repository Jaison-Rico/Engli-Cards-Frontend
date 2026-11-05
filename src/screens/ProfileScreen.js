import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LogOut, Pencil, Check, X, Trash2, Settings, GraduationCap, Target, Flame, Calendar,
  Trophy, Zap, Lock, Moon, Star, Award, Sun, Camera,
} from 'lucide-react-native';
import { Input, Spinner, Typography } from 'heroui-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import GradientFill from '../components/ui/GradientFill';
import { GlassBorder } from '../components/FlipCard';
import TopFade from '../components/ui/TopFade';

const ACHIEVEMENT_ICONS = { Trophy, Zap, Moon, Star, Flame, Award, Sun, GraduationCap };


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
  const enter = (i) => FadeInDown.delay(i * 40).springify().damping(38).stiffness(360);
  const cardClass = 'rounded-[24px] border border-border bg-surface';
  const shadow = elevation(1, theme.mode);
  const flame = theme.colors.flame || '#F97316';

  const stats = [
    { icon: GraduationCap, color: theme.colors.primary, label: 'Nivel', value: displayStats.nivel },
    { icon: Target, color: '#6366F1', label: 'Precisión', value: `${displayStats.precision}%` },
    { icon: Flame, color: flame, label: 'Racha', value: displayStats.racha, unit: displayStats.racha === 1 ? 'día' : 'días' },
    { icon: Calendar, color: '#F5B301', label: 'Quizzes', value: displayStats.quizzes },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barra superior */}
        <View className="mb-2 h-14 flex-row items-center justify-between px-5">
          <Typography type="h3" weight="bold" className="tracking-tight">Perfil</Typography>
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

        {/* Tarjeta de identidad */}
        <Animated.View
          entering={enter(0)}
          className="mx-4 mb-4 overflow-hidden rounded-[28px] px-5 pb-5 pt-6"
          style={[{ backgroundColor: theme.colors.primary }, elevation(2, theme.mode)]}
        >
          {/* Degradado + borde glass: el texto queda directamente sobre el fondo, sin formas detrás. */}
          <GradientFill colors={['#17B3AD', theme.colors.primary, '#07726E']} radius={28} sheen />
          <GlassBorder radius={28} color="rgba(255,255,255,0.22)" />

          <View className="flex-row items-center">
            <View className="relative mr-4">
              <PressableScale
                onPress={handleChangeAvatar}
                accessibilityLabel="Cambiar foto de perfil"
                className="h-20 w-20 overflow-hidden rounded-full"
                style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)' }}
              >
                {userData?.avatar_url ? (
                  <CachedImage uri={userData.avatar_url} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <View className="h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Typography type="h2" weight="bold" style={{ color: '#fff' }}>
                      {userData?.name?.trim() ? userData.name.trim().charAt(0).toUpperCase() : 'U'}
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
                className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-white"
                style={elevation(1)}
              >
                <Camera color={theme.colors.primary} size={13} />
              </View>
            </View>

            <View className="flex-1">
              {isEditingName ? (
                <View>
                  <Input
                    className="text-base font-semibold"
                    value={newName}
                    onChangeText={(text) => { setNewName(text); setNameError(null); }}
                    autoFocus
                    editable={!savingName}
                    placeholder="Tu nombre"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                    maxLength={40}
                  />
                  {nameError ? (
                    <Typography type="body-xs" weight="semibold" className="mt-1.5" style={{ color: '#FFE1E1' }}>{nameError}</Typography>
                  ) : null}
                  <View className="mt-2 flex-row gap-2">
                    <IconButton variant="soft" accessibilityLabel="Guardar nombre" onPress={handleSaveName} disabled={savingName} className="h-9 w-9 bg-white">
                      {savingName ? <Spinner size="sm" /> : <Check color={theme.colors.primary} size={18} />}
                    </IconButton>
                    <IconButton
                      variant="soft"
                      accessibilityLabel="Cancelar edición"
                      onPress={() => { setIsEditingName(false); setNameError(null); }}
                      disabled={savingName}
                      className="h-9 w-9 bg-white"
                    >
                      <X color={theme.colors.danger} size={18} />
                    </IconButton>
                  </View>
                </View>
              ) : (
                <PressableScale
                  onPress={startEditingName}
                  haptic={null}
                  scaleTo={0.98}
                  accessibilityLabel="Editar nombre"
                  className="flex-row items-center gap-2 self-start"
                >
                  <Typography type="h4" weight="bold" numberOfLines={1} className="shrink" style={{ color: '#fff' }}>
                    {userData?.name || 'Usuario'}
                  </Typography>
                  <Pencil color="rgba(255,255,255,0.8)" size={14} />
                </PressableScale>
              )}
              {!isEditingName && userData?.email ? (
                <Typography type="body-sm" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.8)' }}>{userData.email}</Typography>
              ) : null}
              {!isEditingName ? (
                <View className="mt-2 flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                  <Trophy color="#FFD27A" size={12} />
                  <Typography type="body-xs" weight="semibold" style={{ color: '#fff' }}>
                    {Number(displayStats.puntos).toLocaleString('es')} pts
                  </Typography>
                </View>
              ) : null}
            </View>
          </View>

          {/* Progreso de nivel */}
          {!isLoadingStats ? (
            <View className="mt-5">
              <View className="mb-2 flex-row items-center justify-between">
                <Typography type="body-xs" weight="semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Nivel {displayStats.nivel} → {displayStats.nivel + 1}
                </Typography>
                <Typography type="body-xs" weight="semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {levelProgress} / 100 XP
                </Typography>
              </View>
              <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
                <View className="h-full rounded-full bg-white" style={{ width: `${levelProgress}%` }} />
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* Estadísticas */}
        {isLoadingStats && !userStats ? (
          <View className="my-6 items-center"><Spinner size="lg" /></View>
        ) : (
          <Animated.View entering={enter(1)} className="mb-6 flex-row flex-wrap gap-3 px-4">
            {stats.map((s) => (
              <View key={s.label} className={`min-w-[44%] flex-1 p-4 ${cardClass}`} style={shadow}>
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-[14px]" style={{ backgroundColor: `${s.color}1A` }}>
                  <s.icon color={s.color} size={20} />
                </View>
                <Typography type="h3" weight="bold" numberOfLines={1}>
                  {s.value}
                  {s.unit ? <Typography type="body-sm" color="muted"> {s.unit}</Typography> : null}
                </Typography>
                <Typography type="body-xs" weight="semibold" color="muted" className="uppercase tracking-wider">{s.label}</Typography>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Logros */}
        <Animated.View entering={enter(2)}>
          <View className="mb-3 flex-row items-center justify-between px-5">
            <View>
              <Typography type="h5" weight="bold">Logros</Typography>
              {userAchievements.length > 0 ? (
                <Typography type="body-xs" color="muted">
                  {userAchievements.filter((a) => a.is_completed).length} de {userAchievements.length} desbloqueados
                </Typography>
              ) : null}
            </View>
            {userAchievements.length > 3 ? (
              <PressableScale onPress={() => setShowAllAchievements(!showAllAchievements)} haptic={null} hitSlop={8}>
                <Typography type="body-sm" weight="semibold" className="text-accent">
                  {showAllAchievements ? 'Ver menos' : 'Ver todos'}
                </Typography>
              </PressableScale>
            ) : null}
          </View>

          <View className={`mx-4 mb-6 overflow-hidden ${cardClass}`} style={shadow}>
            {visibleAchievements.map((ach, i) => {
              const isLocked = !ach.is_completed;
              const target = Number(ach.target_value) || 0;
              const progressPercent = target > 0 ? Math.min((Number(ach.current_value) / target) * 100, 100) || 0 : 0;
              const Icon = ACHIEVEMENT_ICONS[ach.icon_type] || Trophy;
              return (
                <View
                  key={ach.achievement_id}
                  className={`flex-row items-center px-4 py-4 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <View
                    className={`mr-3 h-12 w-12 items-center justify-center rounded-[16px] ${isLocked ? "bg-default" : ""}`}
                    style={isLocked ? null : { backgroundColor: `${theme.colors.primary}1A` }}
                  >
                    {isLocked
                      ? <Lock color={theme.colors.subtle} size={18} />
                      : <Icon color={theme.colors.primary} size={20} />}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between gap-2">
                      <Typography type="body" weight="semibold" numberOfLines={1} className={`shrink ${isLocked ? 'text-muted' : ''}`}>
                        {ach.title}
                      </Typography>
                      <Typography type="body-xs" weight="bold" style={{ color: isLocked ? theme.colors.subtle : theme.colors.primary }}>
                        {isLocked ? `${Math.round(progressPercent)}%` : '✓'}
                      </Typography>
                    </View>
                    <Typography type="body-xs" color="muted" numberOfLines={2} className="mt-0.5">{ach.description}</Typography>
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
              <Typography type="body-sm" color="muted" align="center" className="my-6">Aún no hay logros disponibles.</Typography>
            ) : null}
          </View>
        </Animated.View>

        {/* Cuenta */}
        <Animated.View entering={enter(3)} className="px-4">
          <Typography type="body-xs" weight="bold" color="muted" className="mb-2 ml-1 uppercase tracking-widest">Cuenta</Typography>
          <View className={`overflow-hidden ${cardClass}`} style={shadow}>
            <PressableScale onPress={handleLogout} scaleTo={0.99} accessibilityLabel="Cerrar sesión" className="flex-row items-center gap-3 px-4 py-4">
              <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-default">
                <LogOut size={17} color={theme.colors.foreground} />
              </View>
              <Typography type="body" weight="semibold" className="flex-1">Cerrar sesión</Typography>
            </PressableScale>
            <View className="h-px bg-border" />
            <PressableScale onPress={handleDeleteProfile} scaleTo={0.99} accessibilityLabel="Eliminar cuenta" className="flex-row items-center gap-3 px-4 py-4">
              <View className="h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${theme.colors.danger}1A` }}>
                <Trash2 size={17} color={theme.colors.danger} />
              </View>
              <Typography type="body" weight="semibold" className="flex-1 text-danger">Eliminar cuenta</Typography>
            </PressableScale>
          </View>
        </Animated.View>
      </ScrollView>
      <TopFade />
    </View>
  );
}
