import { StyleSheet } from "react-native";

const stylesMS = StyleSheet.create({
containerMCTop: {
    paddingTop: 60,
    paddingLeft: 20, 
    backgroundColor: 'white',
    flex: 0, //rellena toda la pantalla
},
textsMC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:15,
    marginBottom:0,
    color:'black',
    borderColor:'red',
},
textButtonMC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'right',
    marginTop:0,
    marginBottom:0,
    marginTop: 5,
    color:'black',
    marginBottom: 15,
},
textButtonMCStats:{
    fontSize:15,
    fontWeight:'bold',
    marginTop: -20,
    color:'black',
    marginBottom: 18,
    marginEnd: 10,
    borderRadius: 2,
    borderColor: 'black',
    borderWidth: 2,
    padding: 5, //espacion dentro del borde
},
inputs:{
    padding:10,
    borderWidth: 2,
    borderRadius:10,
    borderColor: 'blue',
    textAlign:'left',
    height: 50,
},
titlesMC:{
    fontSize: 24,
    fontWeight: 900,
},
subtitlesMC:{
    fontSize: 13,
    fontWeight: 0,
    marginTop: 2,
},
buttons:{
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:'center',
    marginTop: 20,
    width: 150,
    height: 45,
    backgroundColor: 'black',
},
labelFloating: {
    position: 'absolute',
    top: -8, // Posición sobre el borde
    left: 15,
    backgroundColor: 'white',
    paddingHorizontal: 3,
    fontSize: 13,
    color: '#000000ff',
    zIndex: 1
},
inputFieldset: {
    borderWidth: 0, // Sin borde propio
    padding: 15,
},
searchContainer: {
    backgroundColor: 'transparent',
    marginTop: -4,
    marginEnd: 18,
},
searchInputContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
},
})
export default stylesMS;



