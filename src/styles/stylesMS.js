import { StyleSheet } from "react-native";
import theme, { tokens, shadows } from './theme';

const stylesMS = StyleSheet.create({
containerMCTop: {
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: theme.colors.background,
		height: 225,
		borderBottomLeftRadius: tokens.radius.lg,
		borderBottomRightRadius: tokens.radius.lg,
},
textsMC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:15,
    marginBottom:0,
    color: theme.colors.foreground,
},
textButtonMC:{
    fontSize:15,
    fontWeight:'bold',
    textAlign:'right',
    marginTop:0,
    marginBottom:0,
    marginTop: 5,
    color: theme.colors.mutedForeground,
    marginBottom: 15,
},
buttonStats:{
    flexDirection: 'row',
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: 8,
    gap: 5,
},
textButtonMCStats:{
    fontSize:16,
    fontWeight:'bold',
    color: theme.colors.foreground,
    padding: 0, //espacion dentro del borde
},
inputs:{
    padding:10,
    borderWidth: 2,
    borderRadius: tokens.radius.lg,
    borderColor: theme.colors.border,
    textAlign:'left',
    height: 50,
    backgroundColor: theme.colors.card,
},
titlesMC:{
    fontSize: 24,
    fontWeight: 900,
    color: theme.colors.foreground,
},
subtitlesMC:{
    fontSize: 13,
    fontWeight: 0,
    marginTop: 2,
    color: theme.colors.mutedForeground,
},
searchContainer: {
    backgroundColor: 'transparent',
    marginTop: -4
},
searchInputContainer: {
    backgroundColor: theme.colors.muted,
    borderRadius: tokens.radius.md,
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
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: tokens.radius.lg,
    backgroundColor: theme.colors.card,
    ...shadows.card,
},
buttonCFlashcard:{
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: "40%",
    height: 100,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: tokens.radius.lg,
    backgroundColor: theme.colors.card,
    ...shadows.card
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
    backgroundColor: theme.colors.card,
    borderRadius: tokens.radius.md,
    padding: 14,
    marginBottom: 12,
    ...shadows.card,
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
    color: theme.colors.foreground
},
deckCount: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
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
    backgroundColor: theme.colors.card,
    borderRadius: tokens.radius.lg,
    width: '85%',
    maxWidth: 400,
    ...shadows.card,
},
modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
},
modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.foreground,
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
    color: theme.colors.mutedForeground,
    marginBottom: 20,
    lineHeight: 20,
},
modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: 8,
},
modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: tokens.radius.md,
    padding: 12,
    fontSize: 15,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.card,
},
tipContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
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
    color: theme.colors.foreground,
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
    borderTopColor: theme.colors.border,
    gap: 10,
},
modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
},
modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.mutedForeground,
},
modalButtonCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: tokens.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
},
modalButtonTextCreate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
},
// Toast styles
toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: tokens.radius.md,
    ...shadows.card,
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
    color: '#fff',
    lineHeight: 20,
}
})
export default stylesMS;



