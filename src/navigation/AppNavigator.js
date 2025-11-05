import { NavigationContainer } from "@react-navigation/native"; 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RenewPassword from "../screens/RenewPassword";
import HomeScreen from "../screens/HomeScreen";
import MainScreen from "../screens/MainScreen";
import App from "../screens/testSecureStoreExpo";
import NewFlashCard from "../screens/NewFlashCard";
import StatsScreen from "../screens/StatsScreen";
import BottomTabs from "../screens/BottomTabs";
import ProfileScreen from "../screens/ProfileScreen";
import Greetings from "../screens/games/Greetings";
import Fruits from "../screens/games/Fruits";
import { Grab } from "lucide-react-native";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home"> 
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ResetPassword" component={RenewPassword} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
                <Stack.Screen name="App" component={App} options={{ headerShown: false }} />
                <Stack.Screen name="NewFlashCard" component={NewFlashCard} options={{ headerShown: false }} />
                <Stack.Screen name="StatsScreen" component={StatsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Greetings" component={Greetings} options={{ headerShown: false }} />
                <Stack.Screen name="Fruits" component={Fruits} options={{ headerShown: false }} />
                <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}