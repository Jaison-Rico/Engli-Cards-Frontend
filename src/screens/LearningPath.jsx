import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import styles from "../styles/stylesLearningPath";
import greetingsData from './games/imagesGreetings.json';
import FruitsData from './games/imagesFruits.json'
const lessons = [
  { id: 1, title: "Greetings" ,status: "available", data: greetingsData, quiz: 'QuizGreetings'},
  { id: 2, title: "Fruits", status: "available", data: FruitsData, quiz: 'QuizFruits' },
  { id: 3, title: "Familia", status: "locked" },
  { id: 4, title: "Trabajo", status: "locked" },
  { id: 5, title: "Escuela", status: "locked" },
  { id: 6, title: "Viajes", status: "locked" },
  { id: 7, title: "Colores", status: "locked" },
  { id: 8, title: "Animales", status: "locked" },
];


export default function LearningPath({ navigation }) {
    const handleLessonPress = (lesson) => {
      if (lesson.status === "locked") return;
      
      // Navegar a la pantalla correspondiente
      // IMPORTANT: Never pass React elements or functions in navigation params
      // becauase they are non-serilizable and will trigger warnings.
      // Instead, navigate by screen name or pass primitive identifiers.
      navigation.navigate("GameFlashCard",{
        sampleCards: lesson.data,
        quiz: lesson.quiz
      });
    };

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false} // Elimina la barra de desplazamiento
        renderItem={({ item, index }) => {
          const isLeft = index % 2 === 0;

          return (
            <View style={styles.itemContainer}>
                
              {/* Curva de conexión con SVG */}
              {index > 0 && (
                <Svg
                  height="60"
                  width="100%"
                  style={{
                    transform: [{ scaleX: isLeft ? 1 : -1 }],
                  }}
                >
                  <Path
                    d="M20 0 Q50 60 80 0"
                    stroke="#a1a1aa"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Svg>
              )}

              {/* Nodo */}
              <View
                style={[
                  styles.row,
                  { justifyContent: isLeft ? "flex-start" : "flex-end" },
                ]}
              >
                <TouchableOpacity 
                 onPress={() => handleLessonPress(item)}
                  disabled={item.status === "locked"}
                  activeOpacity={0.7}
                  style={[
                    styles.node,
                    item.status === "completed"
                      ? styles.completed
                      : item.status === "available"
                      ? styles.available
                      : styles.locked,
                  ]}
                >
                  <Text style={[styles.text, item.status === "locked" && styles.textLocked]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
    
  );
}
