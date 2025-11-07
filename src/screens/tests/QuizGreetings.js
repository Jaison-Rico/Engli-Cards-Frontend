import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/stylesTestQuiz/StylesQGreetings';
import * as React from 'react';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import { MoveLeft } from 'lucide-react-native';

export default function QuizGreetings() {
  return (
    <SafeAreaView>
      <View style={styles.containerMCTop}>
        <TouchableOpacity>
          <Text style={styles.textButtonBackQG}> 
            <MoveLeft size={25} color="#6200ee"  />
            Saludos
          </Text>
        </TouchableOpacity>
          <Text style={styles.textsQG}>Pregunta 1 de 10!</Text>
          <ProgressBar style={{ marginTop: 40 }} progress={0} color={"#6200ee"} />
        
      </View>

      <View>
        <Text style={styles.textButtonQG}>Hola</Text>
      </View>
    </SafeAreaView>
  );
}

