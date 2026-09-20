import * as SplashScreen from 'expo-splash-screen';
import { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { VimoLogo } from './VimoLogo';

const DURATION = 600;
const HOLD_RATIO = 0.2;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  if (!visible) return null;

  return (
    <Animated.View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          Animated.sequence([
            Animated.delay(DURATION * HOLD_RATIO),
            Animated.timing(opacity, {
              toValue: 0,
              duration: DURATION * (1 - HOLD_RATIO),
              easing: Easing.elastic(0.7),
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) {
              setVisible(false);
            }
          });
        });
      }}
      style={[styles.splashOverlay, { opacity }]}>
      <VimoLogo accessibilityRole="header" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
