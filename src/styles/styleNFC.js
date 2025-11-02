import { Bold } from "lucide-react-native";
import { StyleSheet, Platform } from "react-native";

const stylesNFC = StyleSheet.create({
container: {
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
},
containerCreateFC: {
    marginTop: 30,
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    height: 670,
    borderColor: 'blue',
    //borderWidth: 1.5,
    width: '84%',
    borderRadius: 18,
    alignSelf: 'center',
    backgroundColor: 'white',
},
textsNFC:{
    fontSize:15,
    fontWeight:'bold',
    marginTop:15,
    marginBottom:15,
    color:'black',
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
    borderColor: '#111a2eff',
    textAlign:'left',
    height: 50,
},
titlesNFC:{
    fontSize: 24,
    fontWeight: 900,
},
subtitlesNFC:{
    fontSize: 20,
    fontWeight: 700,
    marginTop: 2,
},
    pickerContainer: {
        borderWidth: 2,
        borderColor: '#111a2eff',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        overflow: 'hidden',
        ...Platform.select({
            android: {
                paddingHorizontal: 0,
            },
            ios: {
                paddingHorizontal: 10,
            },
        }),
    },
    picker: {
        ...Platform.select({
            ios: { height: 150 },
            android: { 
                height: 100,
                marginLeft: 8
            },
        }),
        width: '100%',
        color: '#111a2eff',
        backgroundColor: 'transparent',
    },
    pickerItemStyle: {
        fontSize: 16,
        height: 120,
        color: '#111a2eff',
    },
    // Campo "falso" para iOS: parece un input y abre un Modal con el Picker
    iosPickerTouchable: {
        borderWidth: 2,
        borderColor: '#111a2eff',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },
    iosPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iosPickerText: {
        fontSize: 15,
        color: '#111a2eff',
    },
    iosPlaceholder: {
        fontSize: 15,
        color: '#9aa3b2',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111a2eff',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    modalActionBtn: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelBtn: {
        backgroundColor: '#f0f0f0',
    },
    modalConfirmBtn: {
        backgroundColor: '#111a2eff',
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalCancelText: {
        color: '#111a2eff',
    },
    modalConfirmText: {
        color: 'white',
    },
    // Lista de opciones para Android en el modal
    androidModalList: {
        paddingVertical: 10,
    },
    androidModalOption: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginVertical: 4,
        backgroundColor: '#f5f5f5',
    },
    androidModalOptionSelected: {
        backgroundColor: '#111a2eff',
    },
    androidModalOptionText: {
        fontSize: 16,
        color: '#111a2eff',
        fontWeight: '500',
        textAlign: 'center',
    },
    androidModalOptionTextSelected: {
        color: 'white',
        fontWeight: '600',
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
    width: "40%",
    height: 100,
    borderColor:'#111a2eff',
    borderWidth: 2,
    borderRadius: 10,
    paddingTop: 10,
},
buttonSaveNFC: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: "80%",
    height: 50,
    borderColor:'#111a2eff',
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
},
// Estilos para el modal de éxito
successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
},
successModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '80%',
    maxWidth: 350,
},
successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111a2eff',
    marginTop: 15,
    marginBottom: 8,
},
successModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
},
textsButtomSaveCard:{
    fontSize:15,
    fontWeight:'bold',
    marginTop:14,
    marginBottom:13,
    color:'black',
},
})
export default stylesNFC;



