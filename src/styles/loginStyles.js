import { StyleSheet, Platform } from "react-native";
import theme, { tokens } from './theme';

// Login screen styles matching the Stitch "Login (Teal)" design
export const loginStyles = StyleSheet.create({

    // ── Scroll / Background ──
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#E8F5F0',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    // ── Header (Logo + Title + Subtitle) ──
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F9F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0D4A48',
        letterSpacing: -0.5,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    appSubtitle: {
        fontSize: 14,
        color: '#527F7C',
        letterSpacing: 0.2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },

    // ── Form Card ──
    formCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#12B5B0',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.1,
                shadowRadius: 32,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#08302E',
        marginBottom: 24,
    },

    // ── Field Group ──
    fieldGroup: {
        marginBottom: 18,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#08302E',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    passwordLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0D4A48',
    },

    // ── Input Container ──
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: '#CBEBE8',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
        color: '#527F7C'
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#2c2f30',
        paddingVertical: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    eyeButton: {
        padding: 6,
        marginLeft: 4,
    },

    // ── Login Button ──
    loginButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        backgroundColor: '#12B5B0',
        // Simulated gradient via shadow glow
        ...Platform.select({
            ios: {
                shadowColor: '#12B5B0',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    loginButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.3,
    },

    // ── Divider ──
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 22,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#CBEBE8',
    },
    dividerText: {
        marginHorizontal: 14,
        fontSize: 10,
        fontWeight: '700',
        color: '#0D4A48',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },

    // ── Google Button ──
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#CBEBE8',
        backgroundColor: '#ffffff',
    },
    googleButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#08302E',
    },

    // ── Footer ──
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
    },
    footerText: {
        fontSize: 13,
        color: '#527F7C',
    },
    footerLink: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0D4A48',
    },

    // ── Reset Password Specific Styles ──
    resetContainer: {
        flexGrow: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    resetNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
    },
    resetNavTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0D4A48',
        marginLeft: 16,
    },
    resetHighlightCard: {
        width: '100%',
        backgroundColor: '#D1F5F2', // Soft cyan
        borderRadius: 32,
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: 'center',
        marginBottom: 32,
    },
    resetIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        // Soft shadow
        ...Platform.select({
            ios: {
                shadowColor: '#12B5B0',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    resetCardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#08302E',
        marginBottom: 12,
    },
    resetCardSubtitle: {
        fontSize: 14,
        color: '#08302E',
        textAlign: 'center',
        lineHeight: 22,
    },
    resetFieldGroup: {
        width: '100%',
        marginBottom: 24,
    },
    resetFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    resetFooterText: {
        fontSize: 14,
        color: '#527F7C',
    },
    resetFooterLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#08302E',
        marginLeft: 4,
    },

    // ── Register Specific Styles ──
    registerHeader: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    registerHeaderIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#086B67',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    registerHeaderTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#08302E',
        marginBottom: 4,
    },
    registerHeaderSubtitle: {
        fontSize: 14,
        color: '#527F7C',
    },
    registerCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#12B5B0',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
            },
            android: {
                elevation: 6,
            },
        }),
        marginBottom: 24,
    },
    registerCardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#08302E',
        marginBottom: 6,
    },
    registerCardSubtitle: {
        fontSize: 13,
        color: '#527F7C',
        marginBottom: 24,
    },
    registerFlatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5FAF9',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5F2F0',
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 16,
    },
    registerSubmitBtn: {
        width: '100%',
        height: 52,
        borderRadius: 4,
        backgroundColor: '#086B67',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    infoBlocksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
    },
    infoBlock: {
        flex: 1,
        backgroundColor: '#C5F0EA',
        borderRadius: 4,
        padding: 16,
        alignItems: 'center',
    },
    infoBlockLeft: {
        marginRight: 8,
    },
    infoBlockRight: {
        marginLeft: 8,
    },
    infoBlockTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#086B67',
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 1,
    },
    infoBlockText: {
        fontSize: 10,
        color: '#527F7C',
        textAlign: 'center',
        lineHeight: 14,
    },
    bottomLinksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    bottomLink: {
        fontSize: 12,
        color: '#527F7C',
        marginHorizontal: 16,
    }
});
