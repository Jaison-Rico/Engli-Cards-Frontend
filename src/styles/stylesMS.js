import { StyleSheet } from "react-native";

const stylesMS = StyleSheet.create({
containerMCTop: {
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    height: 225,

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
buttonStats:{
    flexDirection: 'row',
    borderColor:'black',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    gap: 5,
},
textButtonMCStats:{
    fontSize:16,
    fontWeight:'bold',
    color:'black',
    padding: 0, //espacion dentro del borde
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
searchContainer: {
    backgroundColor: 'transparent',
    marginTop: -4
},
searchInputContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
},
containerMCBottonsMain:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
},
buttonCDeck: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: "40%",
    height: 100,
    borderColor:'black',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'gray',
},
buttonCFlashcard:{
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: "40%",
    height: 100,
    borderColor:'black',
    borderWidth: 1,
    borderRadius: 10
}
,
// Styles for deck cards list
deckListContainer: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
},
deckCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
},
deckCardLeft: {
    flexDirection: 'column',
},
deckTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b2545'
},
deckCount: {
    fontSize: 13,
    color: '#62748a',
    marginTop: 6
}
})
export default stylesMS;



