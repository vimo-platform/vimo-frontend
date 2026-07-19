import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { Figma } from "@/components/figma";
import { Colors } from "@/constants/theme";

export function LoadingOverlay({ message }: { message: string }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ).start();
  }, [progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["10%", "100%"],
  });

  return (
    <View style={styles.overlay}>
      <Figma name="loading" />
      <Text style={styles.message}>{message}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  message: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  track: {
    width: 200,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EDEDED",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#818181",
  },
});
