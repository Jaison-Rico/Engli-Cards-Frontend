import { NavigationContainer } from "@react-navigation/native"; 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RenewPassword from "../screens/RenewPassword";
import HomeScreen from "../screens/HomeScreen";
import MainScreen from "../screens/MainScreen";
import NewFlashCard from "../screens/NewFlashCard";
import StatsScreen from "../screens/StatsScreen";
import BottomTabs from "../screens/BottomTabs";
import ProfileScreen from "../screens/ProfileScreen";
import Greetings from "../screens/games/Greetings";
import Fruits from "../screens/games/Fruits";
import Family from "../screens/games/Family";
import Work from "../screens/games/Work";
import School from "../screens/games/School";
import Travel from "../screens/games/Travel";
import GameFlashCard from "../screens/games/GameFlashCard";
import DeckDetailsScreen from "../screens/DeckDetailsScreen";
import UpdateFlashCard from "../screens/UpdateFlashCard";
import OtpScreen from "../screens/OtpScreen";
import NewPasswordScreen from "../screens/NewPasswordScreen";
import DeckQuizScreen from "../screens/DeckQuizScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home"> 
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ResetPassword" component={RenewPassword} options={{ headerShown: false }} />
                <Stack.Screen name="OtpVerification" component={OtpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NewFlashCard" component={NewFlashCard} options={{ headerShown: false }} />
                <Stack.Screen name="StatsScreen" component={StatsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Greetings" component={Greetings} options={{ headerShown: false }} />
                <Stack.Screen name="Fruits" component={Fruits} options={{ headerShown: false }} />
                <Stack.Screen name="Family" component={Family} options={{ headerShown: false }} />
                <Stack.Screen name="Work" component={Work} options={{ headerShown: false }} />
                <Stack.Screen name="School" component={School} options={{ headerShown: false }} />
                <Stack.Screen name="Travel" component={Travel} options={{ headerShown: false }} />
                <Stack.Screen name="GameFlashCard" component={GameFlashCard} options={{ headerShown: false }} />
                <Stack.Screen name="DeckDetails" component={DeckDetailsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UpdateFlashCard" component={UpdateFlashCard} options={{ headerShown: false }} />
                <Stack.Screen name="DeckQuiz" component={DeckQuizScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}