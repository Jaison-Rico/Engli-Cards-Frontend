import { useNavigation } from '@react-navigation/native';
import style1 from '../styles/styles1';
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Image } from "react-native";

export default function LoginScreen() {
    const navigation = useNavigation(); //obtiene la función de navegación
    return (
        <View style={style1.container}>
            <Image source={require('../images/logo.png')} 
            style={{width: 150, height: 150, marginBottom:2, marginTop:0}}
            />

            <Text style={style1.titles}>Login</Text>

            <View style={style1.containerLogin}>
            
            <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                <Text style={style1.labelFloating}>Email Address</Text>
                <TextInput style={style1.inputsLogin} placeholder="abc@example.com" keyboardType="email-address" />
            </View>

            <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                <Text style={style1.labelFloating}>Password</Text>
                <TextInput style={style1.inputsLogin} placeholder="*******" secureTextEntry />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%'}}> 
                <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")} style={style1.textButton}>
                    <Text style={style1.textButtonLogin}>Forgot password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate("Register")} style={style1.textButton}>
                    <Text style={style1.textButtonLogin}>Create an account</Text>
                </TouchableOpacity>
            </View>

            </View>

            <View>
                <TouchableOpacity style={style1.buttons}>
                    <Text style={style1.textLogin}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}