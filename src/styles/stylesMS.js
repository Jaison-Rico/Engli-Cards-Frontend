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
},
// Modal styles
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
},
modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
},
modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b2545',
},
closeButton: {
    padding: 5,
},
modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
},
modalSubtitle: {
    fontSize: 14,
    color: '#62748a',
    marginBottom: 20,
    lineHeight: 20,
},
modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0b2545',
    marginBottom: 8,
},
modalInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#f9f9f9',
},
tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f4ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    gap: 10,
},
tipIcon: {
    fontSize: 18,
},
tipText: {
    flex: 1,
    fontSize: 13,
    color: '#0b2545',
    lineHeight: 18,
},
tipBold: {
    fontWeight: '700',
},
modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
},
modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: 'white',
    alignItems: 'center',
},
modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#62748a',
},
modalButtonCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
},
modalButtonTextCreate: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
},
// Toast styles
toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
},
toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
},
toastText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
}
})
export default stylesMS;



