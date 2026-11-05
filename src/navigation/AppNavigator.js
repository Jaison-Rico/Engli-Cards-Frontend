import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import { useAppTheme } from '../context/ThemeContext';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';

// Onboarding / arranque
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Principal
import StatsScreen from '../screens/StatsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';

// Mazos
import DeckDetailsScreen from '../screens/decks/DeckDetailsScreen';
import DeckQuizScreen from '../screens/decks/DeckQuizScreen';
import NewFlashCardScreen from '../screens/decks/NewFlashCardScreen';
import UpdateFlashCardScreen from '../screens/decks/UpdateFlashCardScreen';

// Juegos
import GameFlashCardScreen from '../screens/games/GameFlashCardScreen';
import CategoryQuizScreen from '../screens/games/CategoryQuizScreen';
import SwipeModeScreen from '../screens/games/SwipeModeScreen';
import MemoryModeScreen from '../screens/games/MemoryModeScreen';
import SurvivalModeScreen from '../screens/games/SurvivalModeScreen';
import { CATEGORY_QUIZZES } from '../data/quizzes';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useAppTheme();
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  // El fondo del navegador coincide con el de la app para evitar destellos
  // blancos durante las transiciones en modo oscuro.
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.foreground,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OtpVerification" component={OtpScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />

        <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="StatsScreen" component={StatsScreen} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />

        <Stack.Screen name="DeckDetails" component={DeckDetailsScreen} />
        <Stack.Screen name="NewFlashCard" component={NewFlashCardScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="UpdateFlashCard" component={UpdateFlashCardScreen} />
        <Stack.Screen name="DeckQuiz" component={DeckQuizScreen} />

        <Stack.Screen name="GameFlashCard" component={GameFlashCardScreen} />
        {/* Minijuegos: sin gesto de volver para no interferir con el arrastre */}
        <Stack.Screen name="SwipeMode" component={SwipeModeScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="MemoryMode" component={MemoryModeScreen} />
        <Stack.Screen name="SurvivalMode" component={SurvivalModeScreen} options={{ gestureEnabled: false }} />
        {/* Una sola pantalla de quiz registrada con el nombre de cada lección */}
        {Object.keys(CATEGORY_QUIZZES).map((name) => (
          <Stack.Screen key={name} name={name} component={CategoryQuizScreen} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
