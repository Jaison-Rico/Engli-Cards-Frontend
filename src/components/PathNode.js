import { useAppTheme } from '../context/ThemeContext';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import get_stylesLP from '../styles/learningPath.styles';
import { Lock, Check, Sparkles, Apple, Users, Briefcase, School, Plane, Palette, Dog, BookOpen } from 'lucide-react-native';

const PathNode = ({ deck, onPress, index }) => {
  const { theme, toggleTheme } = useAppTheme();
  const stylesLP = get_stylesLP(theme);

  const isLocked = deck.is_locked;
  const isCompleted = deck.best_accuracy >= (deck.min_accuracy || 0.9);
  const isActive = !isLocked && !isCompleted;

  const renderIcon = (size, color) => {
    const iconName = deck.deck_name;
    const props = { size, color, strokeWidth: 2 };
    
    switch(iconName) {
      case 'Greetings': return <Sparkles {...props} />;
      case 'Fruits': return <Apple {...props} />;
      case 'Familia': return <Users {...props} />;
      case 'Trabajo': return <Briefcase {...props} />;
      case 'Escuela': return <School {...props} />;
      case 'Viajes': return <Plane {...props} />;
      case 'Colores': return <Palette {...props} />;
      case 'Animales': return <Dog {...props} />;
      default: return <BookOpen {...props} />;
    }
  };

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
            {renderIcon(40, "#fff")}
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
            {renderIcon(45, theme.colors.primary)}
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
