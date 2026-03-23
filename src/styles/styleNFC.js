import { Bold } from "lucide-react-native";
import { StyleSheet, Platform } from "react-native";
import theme, { tokens, shadows } from './theme';

const stylesNFC = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: '#F5FAFB',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#F5FAFB',
    },
    headerIconBack: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#12B5B0',
    },
    headerProfileCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#B2DFDB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerCreateFC: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        marginHorizontal: 16,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 24,
        ...shadows.card,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#08302E',
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F5F4',
        borderRadius: 26,
        height: 52,
        paddingHorizontal: 20,
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        color: '#08302E',
        height: '100%',
    },
    // picker styles
    iosPickerTouchable: {
        flex: 1,
        justifyContent: 'center',
        height: '100%',
    },
    iosPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iosPickerText: {
        fontSize: 15,
        color: '#08302E',
    },
    iosPlaceholder: {
        fontSize: 15,
        color: '#A1CFC9',
    },
    // Image box
    imageUploadBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#A1CFC9',
        borderRadius: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    imageUploadCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#B2DFDB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    imageUploadTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#08302E',
        marginBottom: 4,
    },
    imageUploadSub: {
        fontSize: 12,
        color: '#527F7C',
    },
    // Tip Block
    tipBlock: {
        backgroundColor: '#E8F5F0',
        borderLeftWidth: 4,
        borderLeftColor: '#086B67',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        padding: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#086B67',
        marginLeft: 8,
    },
    tipText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#527F7C',
        marginTop: 4,
    },
    // Submit Button
    saveButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: '#12B5B0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#12B5B0',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginLeft: 8,
    },
    // Modal Overlay
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
    // Android Picker Override
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
    pickerItemStyle: {
        fontSize: 16,
        height: 120,
        color: theme.colors.foreground,
    },
    // Success Modal
    successModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '80%',
        maxWidth: 350,
    },
    successModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#08302E',
        marginTop: 15,
        marginBottom: 8,
    },
    successModalMessage: {
        fontSize: 16,
        color: '#527F7C',
        textAlign: 'center',
        lineHeight: 22,
    },
});
export default stylesNFC;



