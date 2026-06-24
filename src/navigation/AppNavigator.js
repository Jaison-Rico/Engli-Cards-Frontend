import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";

// Auth
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";

// Main
import HomeScreen from "../screens/HomeScreen";
import MainScreen from "../screens/MainScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StatsScreen from "../screens/StatsScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import LearningPathScreen from "../screens/LearningPathScreen";

// Decks
import DeckDetailsScreen from "../screens/decks/DeckDetailsScreen";
import DeckQuizScreen from "../screens/decks/DeckQuizScreen";
import NewFlashCardScreen from "../screens/decks/NewFlashCardScreen";
import UpdateFlashCardScreen from "../screens/decks/UpdateFlashCardScreen";

// Games
import GameFlashCardScreen from "../screens/games/GameFlashCardScreen";
import GreetingsScreen from "../screens/games/GreetingsScreen";
import FruitsScreen from "../screens/games/FruitsScreen";
import FamilyScreen from "../screens/games/FamilyScreen";
import WorkScreen from "../screens/games/WorkScreen";
import SchoolScreen from "../screens/games/SchoolScreen";
import TravelScreen from "../screens/games/TravelScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ResetPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OtpVerification" component={OtpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NewFlashCard" component={NewFlashCardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="StatsScreen" component={StatsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Greetings" component={GreetingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Fruits" component={FruitsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Family" component={FamilyScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Work" component={WorkScreen} options={{ headerShown: false }} />
                <Stack.Screen name="School" component={SchoolScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Travel" component={TravelScreen} options={{ headerShown: false }} />
                <Stack.Screen name="GameFlashCard" component={GameFlashCardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DeckDetails" component={DeckDetailsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UpdateFlashCard" component={UpdateFlashCardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DeckQuiz" component={DeckQuizScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
