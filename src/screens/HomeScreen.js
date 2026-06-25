import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }) {
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play?.();
    const timer = setTimeout(() => { navigation.replace('Login'); }, 4000);
    return () => clearTimeout(timer);
  }, [navigation]);

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
