import { StyleSheet } from "react-native";
import theme, { tokens, shadows } from '../theme';

const stylesQG = StyleSheet.create({
    containerMCTop: {
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: theme.colors.background,
        height: 100,
        borderBottomLeftRadius: tokens.radius.lg,
        borderBottomRightRadius: tokens.radius.lg,
    },
    textsQG:{
        fontSize:15,
        fontWeight:'bold',
        textAlign:'center',
        marginTop:15,
        marginBottom:0,
        color: theme.colors.foreground,
    },
    textButtonQG:{
        fontSize:35,
        fontWeight:'bold',
        textAlign:'center',
        marginBottom:0,
        marginTop: 100,
        color: '#000000',
        marginBottom: 15,
    },
    textButtonBackQG:{
        fontSize:20,
        fontWeight:'bold',
        textAlign:'left',
        marginBottom:0,
        marginTop: 0,
        color: '#000000',
    }
});
export default stylesQG;



