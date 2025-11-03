import { Bold } from "lucide-react-native";
import { StyleSheet, Platform } from "react-native";
import theme, { tokens, shadows } from './theme';

const stylesNFC = StyleSheet.create({
container: {
		paddingTop: 60,
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: theme.colors.background,
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
    borderColor: theme.colors.border,
    //borderWidth: 1.5,
    width: '84%',
    borderRadius: tokens.radius.lg,
    alignSelf: 'center',
    backgroundColor: theme.colors.card,
    ...shadows.card,
},
textsNFC:{
    fontSize:15,
    fontWeight:'bold',
    marginTop:15,
    marginBottom:15,
    color: theme.colors.foreground,
},
textButtonNFC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'right',
    marginTop:0,
    marginBottom:0,
    marginTop: 5,
    color: theme.colors.mutedForeground,
    marginBottom: 15,
},
inputs:{
    padding:10,
    borderWidth: 2,
    borderRadius: tokens.radius.lg,
    borderColor: theme.colors.border,
    textAlign:'left',
    height: 50,
    backgroundColor: theme.colors.card,
    color: theme.colors.foreground,
},
titlesNFC:{
    fontSize: 24,
    fontWeight: 900,
    color: theme.colors.foreground,
},
subtitlesNFC:{
    fontSize: 20,
    fontWeight: 700,
    marginTop: 2,
    color: theme.colors.mutedForeground,
},
    pickerContainer: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: tokens.radius.md,
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
        color: theme.colors.foreground,
        backgroundColor: 'transparent',
    },
    pickerItemStyle: {
        fontSize: 16,
        height: 120,
        color: theme.colors.foreground,
    },
    // Campo "falso" para iOS: parece un input y abre un Modal con el Picker
    iosPickerTouchable: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: tokens.radius.md,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: theme.colors.card,
    },
    iosPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iosPickerText: {
        fontSize: 15,
        color: theme.colors.foreground,
    },
    iosPlaceholder: {
        fontSize: 15,
        color: theme.colors.mutedForeground,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: theme.colors.card,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        ...shadows.card,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.foreground,
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
        borderRadius: tokens.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelBtn: {
        backgroundColor: theme.colors.muted,
    },
    modalConfirmBtn: {
        backgroundColor: theme.colors.accent,
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalCancelText: {
        color: theme.colors.foreground,
    },
    modalConfirmText: {
        color: '#fff',
    },
    // Lista de opciones para Android en el modal
    androidModalList: {
        paddingVertical: 10,
    },
    androidModalOption: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: tokens.radius.md,
        marginVertical: 4,
        backgroundColor: theme.colors.muted,
    },
    androidModalOptionSelected: {
        backgroundColor: theme.colors.accent,
    },
    androidModalOptionText: {
        fontSize: 16,
        color: theme.colors.foreground,
        fontWeight: '500',
        textAlign: 'center',
    },
    androidModalOptionTextSelected: {
        color: '#fff',
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
    borderColor: theme.colors.border,
    borderWidth: 2,
    borderRadius: tokens.radius.lg,
    paddingTop: 10,
    backgroundColor: theme.colors.card,
    ...shadows.card,
},
buttonSaveNFC: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: "80%",
    height: 50,
    borderColor: theme.colors.border,
    borderWidth: 2,
    borderRadius: tokens.radius.lg,
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: theme.colors.accent,
},
// Estilos para el modal de éxito
successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
},
successModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: tokens.radius.lg,
    padding: 30,
    alignItems: 'center',
    ...shadows.card,
    width: '80%',
    maxWidth: 350,
},
successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginTop: 15,
    marginBottom: 8,
},
successModalMessage: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
},
textsButtomSaveCard:{
    fontSize:15,
    fontWeight:'bold',
    marginTop:14,
    marginBottom:13,
    color:'#fff',
},
})
export default stylesNFC;



