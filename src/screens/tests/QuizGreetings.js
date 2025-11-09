import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/stylesTestQuiz/StylesQGreetings';
import { ProgressBar } from 'react-native-paper';
import { MoveLeft } from 'lucide-react-native';

export default function QuizGreetings() {
  return (
    <SafeAreaView>
      <View style={styles.containerMCTop}>
        <TouchableOpacity style={styles.backButton}>
          <MoveLeft size={25} color="#6200ee"  />
          <Text style={styles.textButtonBackQG}> Saludos</Text>
        </TouchableOpacity>
          <Text style={styles.textsQG}>Pregunta 1 de 10!</Text>
          <ProgressBar style={{ marginTop: 20 }} progress={0.5} color={"#6200ee"} />
        
      </View>

      <View style={styles.containerTitleQG}>
        <Text style={styles.textTitleQG}>Hola</Text>
        <Text style={styles.textsQG2}>Selecciona la traducción correcta</Text>
      </View>

      <View>
        <TouchableOpacity style={styles.containerOptionsQG}>
          <Text style={styles.textsQG}>Hello</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.containerOptionsQG}>
          <Text style={styles.textsQG}>Bye</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.containerOptionsQG}>
          <Text style={styles.textsQG}>Good Morning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.containerOptionsQG}>
          <Text style={styles.textsQG}>See you soon</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

