import React from 'react';
import { View } from 'react-native';
import { Lock, Check, Sparkles, Apple, Users, Briefcase, School, Plane, Palette, Dog, BookOpen } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Button, Typography } from 'heroui-native';

const ICON_COMPS = { Sparkles, Apple, Users, Briefcase, School, Plane, Palette, Dog, BookOpen };
const DECK_ICONS = {
  Greetings: Sparkles, Fruits: Apple, Familia: Users, Trabajo: Briefcase,
  Escuela: School, Viajes: Plane, Colores: Palette, Animales: Dog,
};

const PathNode = ({ deck, onPress }) => {
  const { theme } = useAppTheme();

  const isLocked = deck.is_locked;
  const isCompleted = deck.best_accuracy >= (deck.min_accuracy || 0.9);
  const isActive = !isLocked && !isCompleted;

  const IconComp = DECK_ICONS[deck.deck_name] || BookOpen;

  return (
    <View className="items-center my-2">
      {isCompleted && (
        <View className="items-center">
          <Button
            isIconOnly
            className="w-20 h-20 rounded-full bg-success relative"
            onPress={onPress}
          >
            <View className="absolute -top-1 -right-1 bg-yellow-400 px-1.5 py-0.5 rounded-full">
              <Typography type="body-xs" weight="bold" className="text-white text-[8px]">MASTERED</Typography>
            </View>
            <IconComp size={36} color="#fff" strokeWidth={2} />
          </Button>
          <View className="mt-2 bg-success/20 px-4 py-1 rounded-full">
            <Typography type="body-xs" weight="bold" className="text-success">{deck.deck_name}</Typography>
          </View>
        </View>
      )}

      {isActive && (
        <View className="items-center">
          <Button
            isIconOnly
            className="w-20 h-20 rounded-full bg-accent shadow-lg"
            onPress={onPress}
          >
            <IconComp size={40} color="#fff" strokeWidth={2} />
          </Button>
          <View className="mt-2 bg-accent/15 px-4 py-1 rounded-full">
            <Typography type="body-xs" weight="bold" className="text-accent">{deck.deck_name}</Typography>
          </View>
          <View className="mt-1 bg-accent px-3 py-0.5 rounded-full">
            <Typography type="body-xs" weight="bold" className="text-white text-[9px]">CONTINUE LEARNING</Typography>
          </View>
        </View>
      )}

      {isLocked && (
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-default items-center justify-center border-2 border-border">
            <Lock color="#CBD5E1" size={28} />
          </View>
          <View className="mt-2 bg-default px-4 py-1 rounded-full">
            <Typography type="body-xs" color="muted">{deck.deck_name}</Typography>
          </View>
        </View>
      )}
    </View>
  );
};

export default PathNode;
