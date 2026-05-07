import { StyleSheet } from "react-native";

const get_stylesQG = (theme) => {
    const primaryColor = theme.colors.primaryLight || theme.colors.primary;
    return StyleSheet.create({
    containerMCTop: {
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        height: 100,
        borderBottomLeftRadius: theme.tokens.radius.lg,
        borderBottomRightRadius: theme.tokens.radius.lg,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        marginTop: 0,
    },
    textsQG: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 20,
        color: theme.colors.mutedForeground,
    },
    textsQG2: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 0,
        color: theme.colors.mutedForeground,
    },
    optionButton: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        color: theme.colors.foreground,
    },
    textBottomVerifyQG: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF', // Siempre blanco en el botón de verificar activo
    },
    textTitleQG: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        color: theme.colors.foreground,
        marginBottom: 0,
    },
    textButtonBackQG: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        color: theme.colors.foreground,
    },
    containerTitleQG: {
        width: "90%",
        minHeight: 200,
        backgroundColor: theme.colors.card,
        borderRadius: theme.tokens.radius.lg,
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 30,
        alignSelf: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
        ...theme.shadows.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    containerOptionsQG: {
        width: "100%",
        minHeight: 56,
        borderRadius: theme.tokens.radius.md,
        backgroundColor: theme.colors.card,
        borderWidth: 2,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    containerVerifyQG: {
        width: "100%",
        height: 56,
        borderRadius: theme.tokens.radius.md,
        backgroundColor: primaryColor,
        alignSelf: 'center',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    selectedOption: {
        backgroundColor: theme.colors.surfaceContainerLow || '#EAF9FA',
        borderColor: primaryColor,
    },
    correctOption: {
        backgroundColor: '#10B981', // Verde brillante
        borderColor: '#10B981',
    },
    incorrectOption: {
        backgroundColor: '#EF4444', // Rojo brillante
        borderColor: '#EF4444',
    },
    disabledButton: {
        backgroundColor: theme.colors.muted,
        opacity: 0.6,
        shadowOpacity: 0,
    },
    correctButton: {
        backgroundColor: '#10B981',
    },
    incorrectButton: {
        backgroundColor: '#EF4444',
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
        borderRadius: theme.tokens.radius.lg,
        padding: theme.tokens.spacing.lg,
        alignItems: 'center',
        ...theme.shadows.card,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.foreground,
        marginBottom: theme.tokens.spacing.sm,
        textAlign: 'center'
    },
    modalMessage: {
        fontSize: 16,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: theme.tokens.spacing.lg
    },
    modalOkBtn: {
        backgroundColor: primaryColor,
        borderRadius: theme.tokens.radius.md,
        paddingVertical: 12,
        paddingHorizontal: 24
    },
    modalOkText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    }
    });
};
export default get_stylesQG;



