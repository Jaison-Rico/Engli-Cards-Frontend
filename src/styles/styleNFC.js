import { Bold } from "lucide-react-native";
import { StyleSheet } from "react-native";

const stylesNFC = StyleSheet.create({
container: {
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    height: 100,
},
containerCreateFC: {
    marginTop: 30,
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    height: 700,
    borderColor: 'blue',
    borderWidth: 2,
    width: '88%',
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: 'white',
},
textsNFC:{
    fontSize:15,
    fontWeight:'bold',
    marginTop:15,
    marginBottom:15,
    color:'black',
    borderColor:'red',
},
textButtonNFC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'right',
    marginTop:0,
    marginBottom:0,
    marginTop: 5,
    color:'black',
    marginBottom: 15,
},
inputs:{
    padding:10,
    borderWidth: 2,
    borderRadius:10,
    borderColor: 'blue',
    textAlign:'left',
    height: 50,
},
titlesNFC:{
    fontSize: 16,
    fontWeight: 'bold',
},
subtitlesNFC:{
    fontSize: 13,
    fontWeight: 0,
    marginTop: 2,
},
pickerContainer: {
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
},
picker: {
    height: 100,
    color: 'black',
    backgroundColor: 'transparent',
},
containerNFCButtons:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
},
containerNFCButtonsContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: "40%",
    height: 100,
    borderColor:'blue',
    borderWidth: 2,
    borderRadius: 10,
},
buttonSaveNFC: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: "80%",
    height: 50,
    borderColor:'blue',
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 20,
},
})
export default stylesNFC;



