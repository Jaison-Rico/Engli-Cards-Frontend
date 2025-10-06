import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }) {
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play?.();
    const timer = setTimeout(() => {
      navigation.replace('Login'); // 👈 pasa al login luego de 4 segundos
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        source={require('../assets/animations/engliCardsAnimation.json')}
        autoPlay
        loop={false}
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
