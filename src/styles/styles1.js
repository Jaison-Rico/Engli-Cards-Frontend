import { StyleSheet } from "react-native";

const style1 = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
},
texts:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:15,
    marginBottom:0,
    color:'black',
    borderColor:'red',
},
textButton:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:0,
    marginBottom:5,
    marginTop: 5,
    color:'black',
},
textLogin:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:0,
    marginBottom:5,
    marginTop: 5,
    color:'black',
    borderColor:'red',
},
inputs:{
    padding:10,
    borderWidth: 2,
    borderRadius:10,
    borderColor: 'blue',
    textAlign:'left',
    height: 50,
},
titles:{
    fontSize: 30,
    fontWeight: 900,
    marginBottom: 20,
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
},
labelFloating: {
    position: 'absolute',
    top: -8, // Posición sobre el borde
    left: 15,
    backgroundColor: 'white', // Mismo color que el fondo
    paddingHorizontal: 3,
    fontSize: 13,
    color: '#000000ff',
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
}
})

export default style1;
