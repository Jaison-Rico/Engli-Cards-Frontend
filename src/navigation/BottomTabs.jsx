import React, { useMemo } from 'react';
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

const TAB_BAR_HEIGHT = 60;

// Todo lo estático vive fuera del render: el navegador no recibe objetos
// nuevos en cada cambio de pestaña y no re-renderiza las escenas.
const LISTENERS = { tabPress: () => { Haptics.selectionAsync().catch(() => {}); } };

const makeOptions = (Icon) => ({
  tabBarIcon: ({ color, focused }) => <Icon color={color} size={22} strokeWidth={focused ? 2.4 : 2} />,
});

const TABS = [
  { name: 'Inicio', component: MainScreen, options: makeOptions(Home) },
  { name: 'Jugar', component: LearningPathScreen, options: makeOptions(Gamepad2) },
  { name: 'Estadísticas', component: StatsScreen, options: makeOptions(BarChart3) },
  { name: 'Perfil', component: ProfileScreen, options: makeOptions(User) },
];

export default function BottomTabs() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  // En iPhone con indicador de inicio se respeta la zona segura inferior.
  const bottomPadding = Math.max(insets.bottom, 8);

  const screenOptions = useMemo(() => ({
    headerShown: false,
    // Cada pestaña se monta la primera vez que se visita y se congela al
    // salir (no se re-renderiza oculta). NO usar `lazy: false` junto con
    // freezeOnBlur: la pantalla se montaba oculta, se congelaba y sus
    // animaciones de entrada (opacidad 0) nunca terminaban → Perfil en blanco.
    freezeOnBlur: true,
    animation: 'fade',
    transitionSpec: { animation: 'timing', config: { duration: 120 } },
    tabBarHideOnKeyboard: true,
    tabBarShowLabel: true,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.subtle,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4 },
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      height: TAB_BAR_HEIGHT + bottomPadding,
      paddingTop: 6,
      paddingBottom: bottomPadding,
      ...Platform.select({
        ios: { shadowColor: '#08302E', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } },
        android: { elevation: 8 },
      }),
    },
    sceneStyle: { backgroundColor: theme.colors.background },
  }), [theme, bottomPadding]);

  return (
    <Tab.Navigator screenOptions={screenOptions} screenListeners={LISTENERS}>
      {TABS.map(({ name, component, options }) => (
        <Tab.Screen key={name} name={name} component={component} options={options} />
      ))}
    </Tab.Navigator>
  );
}
