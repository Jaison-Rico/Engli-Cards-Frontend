import style1 from "../styles/styles1"; 
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function RegisterScreen() {
    return (
        <View style={style1.container}>
            <View style={style1.containerRegister}>
                <Text style={style1.titles}>Sign up</Text>
                <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                    <Text style={style1.labelFloating}>Full name</Text>
                    <TextInput style={style1.inputsRegister} placeholder="Pepito Perez" />
                </View>

                <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                    <Text style={style1.labelFloating}>Email Address</Text>
                    <TextInput style={style1.inputsRegister} placeholder="abc@email.com" keyboardType="email-address" />
                </View>

                <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                    <Text style={style1.labelFloating}>Password</Text>
                    <TextInput style={style1.inputsRegister} placeholder="*******" secureTextEntry />
                </View>

                <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                    <Text style={style1.labelFloating}>Confirm Password</Text>
                    <TextInput style={style1.inputsRegister} placeholder="*******" secureTextEntry />
                </View>
            </View>
            <View>
                <TouchableOpacity style={style1.buttons}>
                    <Text style={style1.textRegister}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
    
}