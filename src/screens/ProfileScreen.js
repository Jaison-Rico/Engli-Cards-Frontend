import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import stylesProfile from '../styles/stylesProfile';

export default function ProfileScreen() {
  const userData = {
    nivel: 12,
    precision: 87,
    racha: 28,
    diasActivo: 156,
    puntos: 2340,
  };

  return (
    <ScrollView style={stylesProfile.container}>
      {/* Encabezado */}
      <View style={stylesProfile.header}>
        <View style={stylesProfile.avatarContainer}>
          <Text style={stylesProfile.avatarEmoji}>😊</Text>
        </View>
        <Text style={stylesProfile.profileTitle}>Mi Perfil</Text>
        <Text style={stylesProfile.points}>{userData.puntos.toLocaleString()} puntos totales</Text>
      </View>

      {/* Estadísticas principales */}
      <View style={stylesProfile.statsContainer}>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Nivel</Text>
          <Text style={stylesProfile.statValue}>{userData.nivel}</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Precisión</Text>
          <Text style={stylesProfile.statValue}>{userData.precision}%</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Racha</Text>
          <Text style={stylesProfile.statValue}>{userData.racha} días</Text>
        </View>
        <View style={stylesProfile.statBox}>
          <Text style={stylesProfile.statLabel}>Días activo</Text>
          <Text style={stylesProfile.statValue}>{userData.diasActivo}</Text>
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
    </ScrollView>
  );
}
