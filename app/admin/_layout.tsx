import { Stack, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AuthProvider } from "@/hooks/admin/use-admin-auth";
import { ADMIN_APP_FRAME_MAX_WIDTH, Colors } from "@/styles/admin/theme";
import { pretendard } from "@/styles/common/fonts";

function HeaderBackArrow() {
  return (
    <Svg width={9} height={18} viewBox="0 0 9 18" fill="none">
      <Path
        d="M7.5 1.5L1.5 9L7.5 16.5"
        stroke="#111111"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeaderBackButton({ canGoBack }: { canGoBack?: boolean }) {
  if (!canGoBack) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로가기"
      hitSlop={12}
      style={styles.headerBackButton}
      onPress={() => router.back()}
    >
      <HeaderBackArrow />
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.frameOuter}>
        <View style={styles.frameInner}>
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerLeft: ({ canGoBack }) => <HeaderBackButton canGoBack={canGoBack} />,
              headerTitleStyle: {
                fontFamily: pretendard(500),
                fontSize: 20,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="posting/[id]"
              options={{ title: "지원자 목록", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="posting/fcfs/[id]"
              options={{ title: "지원자 목록", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="posting/create"
              options={{ title: "공고 작성", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="posting/preview"
              options={{
                title: "공고 작성",
                headerTitleAlign: "center",
                // 로딩 화면(작성 화면 내부)에서 미리보기로 넘어올 때
                // 딱 끊기지 않고 서서히 크로스페이드되도록.
                animation: "fade",
                animationDuration: 500,
              }}
            />
            <Stack.Screen
              name="posting/edit"
              options={{ title: "공고 수정", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="activity/[id]"
              options={{ title: "상세보기", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="qr/[sessionId]"
              options={{ headerTitleAlign: "center" }}
            />
          </Stack>
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerBackButton: {
    width: 20,
    height: 44,
    marginLeft: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  frameOuter: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  frameInner: {
    flex: 1,
    width: "100%",
    maxWidth: ADMIN_APP_FRAME_MAX_WIDTH,
  },
});
