import { useNavigation } from "@react-navigation/native";
import style1 from "../styles/styles1";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function RenewPassword(){
    return(
        <View style={style1.container}>
            <Text style={style1.titles}>Reset Password</Text>

            <View style={style1.containerLogin}>
                <Text style={style1.labelFloating}>Email Address</Text>
                <TextInput style={style1.inputsResetPassword} placeholder="abc@example.com" keyboardType="email-address" />
            </View>

            <View>
                <TouchableOpacity style={style1.buttons}>
                    <Text style={style1.textButtonResetPassword}>Send</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}