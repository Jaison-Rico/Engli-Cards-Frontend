import { StyleSheet } from 'react-native';

const stylesLP = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
  },
  journeyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#12B5B0',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#08302E',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabelLeft: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#12B5B0',
  },
  progressLabelRight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A6E6C',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#45D0B6',
    borderRadius: 4,
  },

  pathNodeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  // Nodos circulares
  circleCompleted: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#45D0B6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#45D0B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  circleActive: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#45D0B6',
    elevation: 8,
    shadowColor: '#45D0B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circleLocked: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  
  // Badges y Pills
  masteredBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    transform: [{ rotate: '5deg' }],
    zIndex: 10,
  },
  masteredText: {
    color: '#78350F',
    fontSize: 9,
    fontWeight: '900',
  },
  
  pillCompleted: {
    marginTop: -15, // Solapa con el círculo
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 5,
  },
  pillCompletedText: {
    color: '#45D0B6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  pillActive: {
    marginTop: -15,
    backgroundColor: '#45D0B6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#45D0B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 5,
  },
  pillActiveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  pillContinue: {
    marginTop: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillContinueText: {
    color: '#45D0B6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  
  pillLocked: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillLockedText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  }
});


export default stylesLP;
