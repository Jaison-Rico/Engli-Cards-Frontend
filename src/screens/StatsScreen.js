import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ProgressChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const progressData = {
    labels: ["Progreso", "Racha", "Dominio"], 
    data: [0.8, 0.6, 0.4],
  };

  const barData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [{ data: [2, 4, 3, 5, 1, 0, 3] }],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Tus Estadísticas</Text>

      <Text style={styles.sectionTitle}>Progreso General</Text>
      <ProgressChart
        data={progressData}
        width={screenWidth - 40}
        height={180}
        strokeWidth={10}
        radius={35}
        chartConfig={chartConfig}
        hideLegend={false}
        style={styles.chart}
      />

      <Text style={styles.sectionTitle}>Tarjetas Estudiadas (por día)</Text>
      <BarChart
        data={barData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        style={styles.chart}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.stat}>🔹 Mazos creados: <Text style={styles.bold}>5</Text></Text>
        <Text style={styles.stat}>🔹 Tarjetas estudiadas: <Text style={styles.bold}>110</Text></Text>
        <Text style={styles.stat}>🔹 Nivel actual: <Text style={styles.bold}>Intermedio</Text></Text>
        <Text style={styles.stat}>🔹 Racha de estudio: <Text style={styles.bold}>7 días 🔥</Text></Text>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 125, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    height: 100,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#2E7DFF" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  chart: { borderRadius: 16 },
  summaryBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    elevation: 2,
  },
  stat: { fontSize: 15, marginBottom: 5, color: "#444" },
  bold: { fontWeight: "700", color: "#2E7DFF" },
});
