import style1 from '../styles/styles1';
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Image } from "react-native";

export default function LoginScreen() {
    return (
        <View style={style1.container}>
            <Image source={require('../images/logo.png')} 
            style={{width: 200, height: 200, marginBottom:2, marginTop:0}}
            />

            <Text style={style1.titles}>Login</Text>

            <View style={style1.containerLogin}>
            
            <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                <Text style={style1.labelFloating}>Email Address</Text>
                <TextInput style={style1.inputs} placeholder="abc@example.com" keyboardType="email-address" />
            </View>

            <View style={{position: 'relative', marginVertical: 10, width: '100%'}}>
                <Text style={style1.labelFloating}>Password</Text>
                <TextInput style={style1.inputs} placeholder="Password" secureTextEntry />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%'}}> 
                <TouchableOpacity style={style1.textButton}>
                    <Text style={style1.textButton}>Forgot password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style1.textButton}>
                    <Text style={style1.textButton}>Create an account</Text>
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