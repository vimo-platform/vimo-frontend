import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { Figma } from "@/components/figma";
import { Colors } from "@/constants/theme";

export default function QrScreen() {
  const { sessionId, type } = useLocalSearchParams<{ sessionId: string; type?: string }>();
  const isStart = type !== "end";
  const [issuedAt, setIssuedAt] = useState(Date.now());
  const [renewed, setRenewed] = useState(false);

  const regenerate = () => {
    setIssuedAt(Date.now());
    setRenewed(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isStart ? "시작 QR 생성" : "종료 QR 생성",
          headerTitleAlign: "center",
        }}
      />
      <View style={styles.notice}>{renewed && <Figma name="qrCreated" />}</View>
      <View style={styles.qrArea}>
        <QRCode value={`vimo:${sessionId}:${isStart ? "start" : "end"}:${issuedAt}`} size={220} />
        <Text style={styles.caption}>
          봉사생이 활동 {isStart ? "시작" : "종료"} 시{"\n"}스캔하는 QR입니다.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={regenerate}
      >
        <Text style={styles.buttonText}>QR 다시 생성</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    alignItems: "center",
    padding: 24,
  },
  notice: {
    height: 31,
    marginTop: 8,
  },
  qrArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  caption: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 26,
  },
  button: {
    alignSelf: "stretch",
    backgroundColor: "#222222",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
