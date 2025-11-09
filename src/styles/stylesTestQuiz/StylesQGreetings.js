import { StyleSheet } from "react-native";
import theme, { tokens, shadows } from '../theme';

const stylesQG = StyleSheet.create({
    containerMCTop: {
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#FFFFFF',
        height: 100,
        borderBottomLeftRadius: tokens.radius.lg,
        borderBottomRightRadius: tokens.radius.lg,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 5,
    },
    textsQG:{
        fontSize:15,
        fontWeight:'bold',
        textAlign:'center',
        marginTop:15,
        marginBottom:0,
        color: theme.colors.foreground,
    },
    textsQG2:{
        fontSize:15,
        fontWeight:'bold',
        textAlign:'center',
        marginTop:15,
        marginBottom:0,
        color: theme.colors.foreground,
    },
    textTitleQG:{
        fontSize:35,
        fontWeight:'bold',
        textAlign:'center',
        color: '#000000',
        marginBottom: 0,
    },
    textButtonBackQG:{
        fontSize:20,
        fontWeight:'bold',
        textAlign:'left',
        marginBottom:0,
        marginTop: 0,
        color: '#000000',
    },
    containerTitleQG:{
        width: "80%",
        height: 200,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: 'black',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center', // Centra verticalmente el contenido
        alignItems: 'center', // Centra horizontalmente el contenido
        marginTop: 50, // Espacio entre los contenedores
        alignSelf: 'center', // Centra el contenedor en la pantalla
        marginBottom: 60,
    },
    containerOptionsQG:{
        width: "80%",
        height: 60,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: 'black',
        backgroundColor: '#FFFFFF', 
        alignSelf: 'center',
        marginBottom: 25,
    },
});
export default stylesQG;



