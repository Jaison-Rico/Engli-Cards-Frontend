import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6', // Light gray background
    paddingTop: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B', // Slate 800
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B', // Slate 500
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#94A3B8', // Slate 400
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardLocked: {
    backgroundColor: '#F8FAFC', // Slate 50
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
    backgroundColor: '#E0F2FE', // Sky 100
  },
  iconLocked: {
    backgroundColor: '#F1F5F9', // Slate 100
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A', // Slate 900
    marginBottom: 4,
  },
  cardTitleLocked: {
    color: '#94A3B8', // Slate 400
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0EA5E9', // Sky 500
  },
  cardStatusLocked: {
    color: '#CBD5E1', // Slate 300
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#0EA5E9', // Sky 500
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lockIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Slate 100
    borderRadius: 24,
  }
});

export default styles;
