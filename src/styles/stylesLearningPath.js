import { StyleSheet } from 'react-native';

export default function get_stylesLearningPath(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 40,
    },
    headerContainer: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: theme.colors.foreground,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.mutedForeground,
      fontWeight: '500',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    cardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      elevation: 8,
      shadowColor: theme.colors.mutedForeground,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    cardLocked: {
      backgroundColor: theme.colors.muted,
      elevation: 2,
      shadowOpacity: 0.05,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    iconAvailable: {
      backgroundColor: theme.colors.primaryLight || theme.colors.primary,
    },
    iconLocked: {
      backgroundColor: theme.colors.muted,
    },
    textContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.foreground,
      marginBottom: 4,
    },
    cardTitleLocked: {
      color: theme.colors.mutedForeground,
    },
    cardStatus: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    cardStatusLocked: {
      color: theme.colors.mutedForeground,
      fontWeight: '600',
    },
    playButton: {
      backgroundColor: theme.colors.primary,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    lockIconContainer: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: 24,
    }
  });
}
