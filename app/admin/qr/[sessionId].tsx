import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { isAuthError } from "@/api/client";
import { Figma } from "@/features/admin/components/figma";
import { Colors } from "@/features/admin/constants/theme";
import { generateSessionQr } from "@/features/admin/api/sessions";

export default function QrScreen() {
  const { sessionId, type } = useLocalSearchParams<{ sessionId: string; type?: string }>();
  const isStart = type !== "end";

  const [token, setToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewed, setRenewed] = useState(false);

  const fetchQr = useCallback(
    async (isRenew: boolean) => {
      if (!sessionId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await generateSessionQr(sessionId, isStart ? "start" : "end");
        setToken(result.qrToken);
        setRemaining(result.expireTime ?? 60);
        setRenewed(isRenew);
      } catch (err) {
        if (isAuthError(err)) {
          Alert.alert("로그인 만료", "로그인이 만료되었어요. 다시 로그인해 주세요.");
          router.replace("/");
          return;
        }

        setError("QR 생성에 실패했어요. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, isStart],
  );

  useEffect(() => {
    fetchQr(false);
  }, [fetchQr]);

  // 발급된 토큰 만료 카운트다운 (새 토큰마다 리셋)
  useEffect(() => {
    if (!token) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [token]);

  const isExpired = Boolean(token) && remaining <= 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isStart ? "시작 QR 생성" : "종료 QR 생성",
          headerTitleAlign: "center",
          // 기본 헤더 백버튼이 웹/일부 상황에서 동작하지 않아 명시적으로 뒤로가기 버튼을 지정
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
              hitSlop={12}
              style={({ pressed }) => [styles.headerBack, pressed && styles.pressed]}
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/admin/(tabs)")
              }
            >
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.notice}>{renewed && !isExpired && <Figma name="qrCreated" />}</View>

      <View style={styles.qrArea}>
        {loading ? (
          <View style={styles.qrPlaceholder}>
            <ActivityIndicator color={Colors.text} />
          </View>
        ) : error ? (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : token && !isExpired ? (
          <>
            <QRCode value={token} size={220} />
            <Text style={styles.timer}>유효 시간 {remaining}초</Text>
          </>
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.stateText}>
              QR이 만료되었어요.{"\n"}다시 생성해 주세요.
            </Text>
          </View>
        )}

        {!loading && !error && token && !isExpired && (
          <Text style={styles.caption}>
            봉사생이 활동 {isStart ? "시작" : "종료"} 시{"\n"}스캔하는 QR입니다.
          </Text>
        )}
      </View>

      <Pressable
        disabled={loading}
        style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
        onPress={() => fetchQr(true)}
      >
        <Text style={styles.buttonText}>{loading ? "생성 중..." : "QR 다시 생성"}</Text>
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
    gap: 24,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  stateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
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
  headerBack: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
