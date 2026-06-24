import { StyleSheet, Platform } from "react-native";
// Login screen styles matching the Stitch "Login (Teal)" design
export const get_loginStyles = (theme) => StyleSheet.create({

    // ── Scroll / Background ──
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
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
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.foreground,
        letterSpacing: -0.5,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    appSubtitle: {
        fontSize: 14,
        color: theme.colors.mutedForeground,
        letterSpacing: 0.2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },

    // ── Form Card ──
    formCard: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
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
        color: theme.colors.foreground,
        marginBottom: 24,
    },

    // ── Field Group ──
    fieldGroup: {
        marginBottom: 18,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.foreground,
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
        color: theme.colors.primary,
    },

    // ── Input Container ──
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
        color: theme.colors.mutedForeground
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.foreground,
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
        backgroundColor: theme.colors.primary,
        // Simulated gradient via shadow glow
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
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
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: 14,
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.mutedForeground,
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
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    googleButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.foreground,
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
        color: theme.colors.mutedForeground,
    },
    footerLink: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
    },

    // ── Reset Password Specific Styles ──
    resetContainer: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.foreground,
        marginLeft: 16,
    },
    resetHighlightCard: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: 32,
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: 'center',
        marginBottom: 32,
        ...theme.shadows.soft
    },
    resetIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        // Soft shadow
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
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
        color: theme.colors.foreground,
        marginBottom: 12,
    },
    resetCardSubtitle: {
        fontSize: 14,
        color: theme.colors.mutedForeground,
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
        color: theme.colors.mutedForeground,
    },
    resetFooterLink: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.foreground,
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
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    registerHeaderTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.foreground,
        marginBottom: 4,
    },
    registerHeaderSubtitle: {
        fontSize: 14,
        color: theme.colors.mutedForeground,
    },
    registerCard: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
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
        color: theme.colors.foreground,
        marginBottom: 6,
    },
    registerCardSubtitle: {
        fontSize: 13,
        color: theme.colors.mutedForeground,
        marginBottom: 24,
    },
    registerFlatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 16,
    },
    registerSubmitBtn: {
        width: '100%',
        height: 52,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
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
        backgroundColor: theme.colors.muted,
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
        color: theme.colors.primary,
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 1,
    },
    infoBlockText: {
        fontSize: 10,
        color: theme.colors.mutedForeground,
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
        color: theme.colors.mutedForeground,
        marginHorizontal: 16,
    },

    // ── OTP Screen Styles ──
    otpMainContainer: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    otpIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        marginBottom: 32,
        ...theme.shadows.soft
    },
    otpTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.foreground,
        marginBottom: 8,
        textAlign: 'center',
    },
    otpSubtitle: {
        fontSize: 15,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    otpInputRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    otpCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCircleFilled: {
        borderWidth: 0,
        backgroundColor: theme.colors.card,
        // Shadow for filled state
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    otpText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.foreground,
    },
    otpDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.mutedForeground,
    },
    timerCapsule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.muted,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 32,
    },
    timerText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
        marginLeft: 8,
        textTransform: 'uppercase',
    },

    // ── Reset Password Styles ──
    strengthContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
        marginBottom: 24,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.border,
        marginHorizontal: 3,
    },
    strengthBarActive: {
        backgroundColor: theme.colors.primary,
    },
    passwordHint: {
        fontSize: 12,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: 32,
    }
});
