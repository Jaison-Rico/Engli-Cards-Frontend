import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Gamepad2, BarChart3, User } from "lucide-react-native";
import MainScreen from "../screens/MainScreen";
import StatsScreen from "../screens/StatsScreen";
import NewFlashCard from "../screens/NewFlashCard";
import ProfileScreen from "../screens/ProfileScreen";
import LearningPath from "../screens/LearningPath";

import { useAppTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { theme } = useAppTheme();

  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopWidth: 0.5,
            borderTopColor: theme.colors.border,
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
          name="Jugar"
          component={LearningPath}
          options={{
            tabBarIcon: ({ color }) => <Gamepad2 color={color} size={22} />,
          }}
        />

        <Tab.Screen
          name="Estadísticas"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} />,
          }}
        />

        {/* Nueva pestaña del perfil */}
        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <User color={color} size={22} />,
          }}
        />
      </Tab.Navigator>
  );
}
