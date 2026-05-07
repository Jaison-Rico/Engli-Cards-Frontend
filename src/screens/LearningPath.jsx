import { useAppTheme } from '../context/ThemeContext';
import React from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { Play, Lock, Sparkles, BookOpen, Apple, Users, Briefcase, School, Plane, Palette, Dog } from "lucide-react-native";
import get_styles from '../styles/stylesLearningPath';
import greetingsData from './games/imagesGreetings.json';
import FruitsData from './games/imagesFruits.json';

const lessons = [
  { id: 1, title: "Greetings", status: "available", data: greetingsData, quiz: 'QuizGreetings', icon: 'Sparkles' },
  { id: 2, title: "Fruits", status: "available", data: FruitsData, quiz: 'QuizFruits', icon: 'Apple' },
  { id: 3, title: "Familia", status: "locked", icon: 'Users' },
  { id: 4, title: "Trabajo", status: "locked", icon: 'Briefcase' },
  { id: 5, title: "Escuela", status: "locked", icon: 'School' },
  { id: 6, title: "Viajes", status: "locked", icon: 'Plane' },
  { id: 7, title: "Colores", status: "locked", icon: 'Palette' },
  { id: 8, title: "Animales", status: "locked", icon: 'Dog' },
];

export default function LearningPath({ navigation }) {
  const { theme, toggleTheme } = useAppTheme();
  const styles = get_styles(theme);

  const handleLessonPress = (lesson) => {
    if (lesson.status === "locked") return;
    
    // Navegar a la pantalla correspondiente
    navigation.navigate("GameFlashCard", {
      sampleCards: lesson.data,
      quiz: lesson.quiz
    });
  };

  const renderIcon = (iconName, color) => {
    switch(iconName) {
      case 'Sparkles': return <Sparkles size={30} color={color} strokeWidth={2.5} />;
      case 'Apple': return <Apple size={30} color={color} strokeWidth={2.5} />;
      case 'Users': return <Users size={30} color={color} strokeWidth={2.5} />;
      case 'Briefcase': return <Briefcase size={30} color={color} strokeWidth={2.5} />;
      case 'School': return <School size={30} color={color} strokeWidth={2.5} />;
      case 'Plane': return <Plane size={30} color={color} strokeWidth={2.5} />;
      case 'Palette': return <Palette size={30} color={color} strokeWidth={2.5} />;
      case 'Dog': return <Dog size={30} color={color} strokeWidth={2.5} />;
      default: return <BookOpen size={30} color={color} strokeWidth={2.5} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Juegos</Text>
        <Text style={styles.headerSubtitle}>Aprende palabras divirtiéndote</Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isLocked = item.status === "locked";
          
          return (
            <TouchableOpacity 
              onPress={() => handleLessonPress(item)}
              disabled={isLocked}
              activeOpacity={0.8}
              style={[
                styles.cardContainer,
                isLocked && styles.cardLocked
              ]}
            >
              <View style={[
                styles.iconContainer, 
                isLocked ? styles.iconLocked : styles.iconAvailable
              ]}>
                {renderIcon(item.icon, isLocked ? theme.colors.mutedForeground : theme.colors.primary)}
              </View>

              <View style={styles.textContainer}>
                <Text style={[
                  styles.cardTitle,
                  isLocked && styles.cardTitleLocked
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.cardStatus,
                  isLocked && styles.cardStatusLocked
                ]}>
                  {isLocked ? "Bloqueado" : "Jugar ahora"}
                </Text>
              </View>

              {isLocked ? (
                <View style={styles.lockIconContainer}>
                  <Lock size={22} color={theme.colors.mutedForeground} strokeWidth={2.5} />
                </View>
              ) : (
                <View style={styles.playButton}>
                  <Play size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
