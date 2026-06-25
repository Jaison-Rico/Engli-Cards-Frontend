import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';

export default function QuizStartButton({
  onPress = () => {},
  label = 'Comenzar Prueba',
  iconName = 'play-outline',
  iconSize = 20,
  iconColor = '#fff',
}) {
  return (
    <Button size="sm" onPress={onPress}>
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
      <Button.Label>{label}</Button.Label>
    </Button>
  );
}
