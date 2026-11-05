import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const animation = useRef(null);
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    animation.current?.play?.();
    if (!isLoaded) return undefined;
    const timer = setTimeout(() => {
      navigation.replace(user
        ? (user.onboarding_completed ? 'BottomTabs' : 'Onboarding')
        : 'Login');
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoaded, navigation, user]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <LottieView
        ref={animation}
        source={require('../assets/animations/logoApp.json')}
        autoPlay
        loop={false}
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
}
