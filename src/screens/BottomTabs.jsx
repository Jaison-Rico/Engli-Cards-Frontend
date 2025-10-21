import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, BookOpen, BarChart3} from "lucide-react-native";
import MainScreen from "../screens/MainScreen";
import StatsScreen from "../screens/StatsScreen";
import NewFlashCard from "../screens/NewFlashCard";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "#ccc",
            height: 60,
            paddingBottom: 5,
          },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={MainScreen}
          options={{
            tabBarIcon: ({ color }) => <Home color={color} size={22} />,
          }}
        />

        <Tab.Screen
          name="Flashcards"
          component={NewFlashCard}
          options={{
            tabBarIcon: ({ color }) => <BookOpen color={color} size={22} />,
          }}
        />

        <Tab.Screen
          name="Estadisticas"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} />,
          }}
        />
      </Tab.Navigator>
  );
}
