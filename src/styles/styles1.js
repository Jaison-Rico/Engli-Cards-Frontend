import { getGlobalStyles } from './theme';


const get_style1 = (theme) => {
	const globalStyles = getGlobalStyles(theme);
	return StyleSheet.create({
container: {
		...globalStyles.container,
		alignItems: 'center',
		justifyContent: 'center',
},
texts:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:15,
    marginBottom:0,
    color: theme.colors.foreground,
},
textButton:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:0,
    marginBottom:5,
    marginTop: 5,
    color: theme.colors.mutedForeground,
    marginBottom: 15,
},
textButtonLogin:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:0,
    marginBottom:5,
    marginTop: -15,
    color: theme.colors.mutedForeground,
    marginBottom: 15,
},
textButtonResetPassword:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:0,
    marginBottom:5,
    color:'#fff',
},
textLogin:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    color:'#fff',
},
textRegister:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    color:'#fff',
},
inputs:{
    ...globalStyles.input,
},
inputsLogin:{
    ...globalStyles.input,
    marginBottom: 20,
},
inputsRegister:{
    ...globalStyles.input,
    marginBottom: 35,
},
inputsResetPassword:{
    ...globalStyles.input,
    width: 300,
},
titles:{
    fontSize: 30,
    fontWeight: 900,
    marginBottom: 20,
    color: theme.colors.foreground,
},
buttons:{
    height: theme.tokens.components.buttonHeight,
    paddingHorizontal: theme.tokens.components.buttonPaddingX,
    borderRadius: theme.tokens.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:'center',
    marginTop: 20,
    width: 200,
    backgroundColor: theme.colors.accent,
    ...theme.shadows.soft,
},
labelFloating: {
    position: 'absolute',
    top: -8, // Posición sobre el borde
    left: 15,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 3,
    fontSize: 13,
    color: theme.colors.mutedForeground,
    zIndex: 1
},
inputFieldset: {
    borderWidth: 0, // Sin borde propio
    padding: 15,
    fontSize: 16,
    backgroundColor: 'transparent'
},
containerLogin:{
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
},
containerRegister:{
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
},
// Estilos para el sign in with
dividerContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 30,
},
dividerLine: {
    flex: 0.3, //este es nuestro largor de linea
    height: 2,
    backgroundColor: theme.colors.border,
    
},
dividerText: {
    marginHorizontal: 10, // esta es la separación entre texto y línea
    color: theme.colors.mutedForeground,
    fontSize: 16,
    textAlign: 'center',
},
footerText: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
}
})
export default get_style1;
