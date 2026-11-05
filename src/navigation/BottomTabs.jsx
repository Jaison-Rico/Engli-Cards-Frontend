import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, Gamepad2, BarChart3, User } from 'lucide-react-native';
import MainScreen from '../screens/MainScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LearningPathScreen from '../screens/LearningPathScreen';
import { useAppTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 58;

const TABS = [
  { name: 'Inicio', component: MainScreen, icon: Home },
  { name: 'Jugar', component: LearningPathScreen, icon: Gamepad2 },
  { name: 'Estadísticas', component: StatsScreen, icon: BarChart3 },
  { name: 'Perfil', component: ProfileScreen, icon: User },
];

export default function BottomTabs() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  // En iPhone con indicador de inicio se respeta la zona segura inferior.
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtle,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          height: TAB_BAR_HEIGHT + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          ...Platform.select({ android: { elevation: 0 } }),
        },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      screenListeners={{
        tabPress: () => { Haptics.selectionAsync().catch(() => {}); },
      }}
    >
      {TABS.map(({ name, component, icon: Icon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ color, focused }) => <Icon color={color} size={22} strokeWidth={focused ? 2.4 : 2} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
