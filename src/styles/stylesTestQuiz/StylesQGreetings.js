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
    containerVerifyQG:{
        width: "80%",
        height: 60,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: 'black',
        backgroundColor: '#FFFFFF', 
        alignSelf: 'center',
        marginBottom: 25,
        marginTop: 40,
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
    },
    correctOption: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
    },
    incorrectOption: {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
    },
    disabledButton: {
        backgroundColor: '#f5f5f5',
        opacity: 0.6,
    },
        correctButton: {
        backgroundColor: '#4caf50',
    },
        incorrectButton: {
        backgroundColor: '#f44336',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing.lg,
        alignItems: 'center',
        ...shadows.card,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.foreground,
        marginBottom: tokens.spacing.sm,
        textAlign: 'center'
    },
    modalMessage: {
        fontSize: 16,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: tokens.spacing.lg
    },
    modalOkBtn: {
        backgroundColor: theme.colors.accent,
        borderRadius: tokens.radius.md,
        paddingVertical: 12,
        paddingHorizontal: 24
    },
    modalOkText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    }
});
export default stylesQG;



