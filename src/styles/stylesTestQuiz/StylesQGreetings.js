import { StyleSheet } from "react-native";

const get_stylesQG = (theme) => {
    const primaryColor = theme.colors.primaryLight || theme.colors.primary;
    return StyleSheet.create({
        containerMCTop: {
            paddingHorizontal: 20,
            backgroundColor: theme.colors.card,
            paddingBottom: 15,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            ...theme.shadows.soft,
        },
        backButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        textButtonBackQG: {
            fontSize: 20,
            fontWeight: '800',
            textAlign: 'left',
            color: theme.colors.foreground,
            marginLeft: 8,
        },
        textsQG: {
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 12,
            color: theme.colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        textsQG2: {
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 12,
            color: theme.colors.mutedForeground,
            opacity: 0.8,
        },
        containerTitleQG: {
            width: "90%",
            minHeight: 180,
            backgroundColor: theme.colors.card,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
            alignSelf: 'center',
            marginBottom: 24,
            paddingHorizontal: 24,
            paddingVertical: 32,
            ...theme.shadows.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        textTitleQG: {
            fontSize: 36,
            fontWeight: '900',
            textAlign: 'center',
            color: theme.colors.foreground,
            letterSpacing: -0.5,
        },
        containerOptionsQG: {
            width: "100%",
            minHeight: 64,
            borderRadius: 20,
            backgroundColor: theme.colors.card,
            borderWidth: 2,
            borderColor: theme.colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 4,
            ...theme.shadows.soft,
            elevation: 2,
        },
        optionButton: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.foreground,
            flex: 1,
        },
        selectedOption: {
            backgroundColor: theme.colors.surfaceContainer || '#F0F9F8',
            borderColor: primaryColor,
            borderWidth: 2,
        },
        correctOption: {
            backgroundColor: '#ECFDF5', // Esmeralda muy claro
            borderColor: '#10B981',
            borderWidth: 2,
        },
        incorrectOption: {
            backgroundColor: '#FEF2F2', // Rojo muy claro
            borderColor: '#EF4444',
            borderWidth: 2,
        },
        optionTextCorrect: {
            color: '#065F46',
        },
        optionTextIncorrect: {
            color: '#991B1B',
        },
        containerVerifyQG: {
            width: "100%",
            height: 60,
            borderRadius: 20,
            backgroundColor: primaryColor,
            alignSelf: 'center',
            marginTop: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.card,
        },
        textBottomVerifyQG: {
            fontSize: 18,
            fontWeight: '800',
            textAlign: 'center',
            color: '#FFFFFF',
            letterSpacing: 0.5,
        },
        disabledButton: {
            backgroundColor: theme.colors.muted,
            opacity: 0.5,
        },
        correctButton: {
            backgroundColor: '#10B981',
        },
        incorrectButton: {
            backgroundColor: '#EF4444',
        },
        // Modal de resultados
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalCard: {
            width: '85%',
            backgroundColor: theme.colors.card,
            borderRadius: 32,
            padding: 32,
            alignItems: 'center',
            ...theme.shadows.card,
        },
        modalTitle: {
            fontSize: 28,
            fontWeight: '900',
            color: theme.colors.foreground,
            marginBottom: 12,
            textAlign: 'center'
        },
        modalMessage: {
            fontSize: 18,
            color: theme.colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 24,
        },
        modalOkBtn: {
            backgroundColor: primaryColor,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 40,
            width: '100%',
            alignItems: 'center',
        },
        modalOkText: {
            color: '#fff',
            fontWeight: '800',
            fontSize: 18,
        }
    });
};

export default get_stylesQG;



