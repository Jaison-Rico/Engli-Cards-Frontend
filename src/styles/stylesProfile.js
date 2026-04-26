import { StyleSheet } from 'react-native';
import theme, { tokens, shadows } from './theme';

const stylesProfile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: tokens.radius.lg,
    borderBottomRightRadius: tokens.radius.lg,
  },
  avatarContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
    ...shadows.card,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 150,
    textAlign: 'center',
  },
  editIconButton: {
    padding: 5,
  },
  points: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 10,
  },
  statBox: {
    backgroundColor: theme.colors.card,
    width: '40%',
    borderRadius: tokens.radius.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.card,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginTop: 4,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: 12,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: theme.colors.card,
    width: '47%',
    borderRadius: tokens.radius.md,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    textAlign: 'center',
    marginTop: 6,
  },
  achievementText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: 4,
  },
  logoutContainer: {
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: tokens.radius.md,
    gap: 10,
    ...shadows.card,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: '#dc3545',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: tokens.radius.md,
    gap: 10,
    marginTop: 15,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default stylesProfile;
