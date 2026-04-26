import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import stylesLP from '../styles/stylesLearningPath';
import { Lock, Check, Apple } from 'lucide-react-native'; // Usamos iconos aproximados

const PathNode = ({ deck, onPress, index }) => {
  const isLocked = deck.is_locked;
  const isCompleted = deck.best_accuracy >= (deck.min_accuracy || 0.9);
  const isActive = !isLocked && !isCompleted;

  return (
    <View style={stylesLP.pathNodeContainer}>
      {isCompleted && (
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={onPress}
            style={stylesLP.circleCompleted}
          >
            <View style={stylesLP.masteredBadge}>
              <Text style={stylesLP.masteredText}>MASTERED</Text>
            </View>
            <Check color="#fff" size={32} strokeWidth={3} />
          </TouchableOpacity>
          <View style={stylesLP.pillCompleted}>
            <Text style={stylesLP.pillCompletedText}>{deck.deck_name}</Text>
          </View>
        </View>
      )}

      {isActive && (
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={onPress}
            style={stylesLP.circleActive}
          >
            {/* Si tienes una imagen del mazo, se podría usar aquí. Por ahora un icono o emoji */}
            <Apple color="#45D0B6" size={40} strokeWidth={1.5} />
          </TouchableOpacity>
          <View style={stylesLP.pillActive}>
            <Text style={stylesLP.pillActiveText}>{deck.deck_name}</Text>
          </View>
          <View style={stylesLP.pillContinue}>
            <Text style={stylesLP.pillContinueText}>CONTINUE LEARNING</Text>
          </View>
        </View>
      )}

      {isLocked && (
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={stylesLP.circleLocked}
          >
            <Lock color="#CBD5E1" size={28} />
          </TouchableOpacity>
          <View style={stylesLP.pillLocked}>
            <Text style={stylesLP.pillLockedText}>{deck.deck_name}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PathNode;
