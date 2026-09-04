import { LinearGradient as ProgressGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

const TEXT_COLOR = "#222222";
const CARD_COLOR = "#FFFFFF";

function VimoLoadingLogo({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 160) / 166} viewBox="0 0 166 160" fill="none">
      <Defs>
        <LinearGradient id="vimoLogoGrad" x1="0" y1="0" x2="166" y2="160" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#888888" />
          <Stop offset="0.0001" stopColor="#222222" />
          <Stop offset="0.5586" stopColor="#7B7B7B" />
          <Stop offset="1" stopColor="#D2D2D2" stopOpacity={0.8} />
        </LinearGradient>
      </Defs>
      <Path
        d="M35.0125 7.60937C35.1747 6.94474 36.1198 6.94474 36.282 7.60937L38.4346 16.4327C39.2852 19.9189 42.0957 22.5856 45.6217 23.2522L53.0079 24.6485C53.7172 24.7826 53.7172 25.7983 53.0079 25.9324L45.6217 27.3287C42.0957 27.9952 39.2852 30.662 38.4346 34.1482L36.282 42.9715C36.1198 43.6361 35.1747 43.6361 35.0125 42.9715L32.8599 34.1482C32.0093 30.662 29.1988 27.9952 25.6728 27.3287L18.2866 25.9324C17.5773 25.7983 17.5773 24.7826 18.2866 24.6485L25.6728 23.2522C29.1988 22.5856 32.0093 19.9189 32.8599 16.4327L35.0125 7.60937Z"
        fill="url(#vimoLogoGrad)"
      />
      <Path
        d="M79.383 15.3909C80.2809 11.5703 85.7191 11.5703 86.617 15.391L91.1634 34.7367C95.9123 54.9438 112.22 70.3932 132.654 74.0434L145.524 76.3423C149.607 77.0717 149.607 82.9283 145.524 83.6577L132.654 85.9566C112.22 89.6068 95.9123 105.056 91.1634 125.263L86.617 144.609C85.7191 148.43 80.2809 148.43 79.383 144.609L74.8366 125.263C70.0877 105.056 53.7798 89.6068 33.3456 85.9566L20.4759 83.6577C16.393 82.9283 16.393 77.0717 20.4759 76.3423L33.3456 74.0434C53.7798 70.3932 70.0877 54.9438 74.8366 34.7367L79.383 15.3909Z"
        fill="url(#vimoLogoGrad)"
      />
      <Path
        d="M69.985 84.441C66.9539 84.4549 65.0036 81.209 66.4384 78.5385C68.644 74.4335 74.8957 76.8241 73.8361 81.3674L73.2023 84.0849C72.215 88.318 77.3413 91.2576 80.4689 88.2519L92.8559 76.3477C96.7211 72.6332 102.755 77.4181 100.044 82.0475C99.2221 83.4506 97.7231 84.3144 96.0971 84.3218L69.985 84.441Z"
        fill="white"
      />
    </Svg>
  );
}

export const LOADING_FILL_DURATION_MS = 5500;

export function LoadingOverlay({ message }: { message: string }) {
  const appear = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const appearAnimation = Animated.timing(appear, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    appearAnimation.start();
    return () => appearAnimation.stop();
  }, [appear]);

  useEffect(() => {
    const progressAnimation = Animated.timing(progress, {
      toValue: 1,
      duration: LOADING_FILL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    progressAnimation.start();
    return () => progressAnimation.stop();
  }, [progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["8%", "100%"],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: appear }]}>
      <VimoLoadingLogo size={120} />
      <Text style={styles.message}>{message}</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFillMask, { width: fillWidth }]}>
          <ProgressGradient
            colors={["#4D4D4D", "#BDBDBD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: CARD_COLOR,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  message: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_COLOR,
  },
  progressTrack: {
    width: 192,
    height: 7,
    borderRadius: 9,
    backgroundColor: "#D9D9D9",
    overflow: "hidden",
  },
  progressFillMask: {
    height: 7,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
    overflow: "hidden",
  },
  progressGradient: {
    width: 192,
    height: 7,
  },
});
